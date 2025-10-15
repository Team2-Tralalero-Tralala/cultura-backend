// Services/package/package-service.ts
import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";
import type { PackageDto, PackageFileDto } from "./package-dto.js";
import { composeDateTimeIso } from "../../Libs/Types/package-type.js";

/* ============================================================================================
 * UTIL HELPERS
 * ============================================================================================ */
async function getUserOrFail(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, memberOf: true, communitiesAdmin: true },
    });
    if (!user) throw new Error(`User ID ${userId} ไม่พบในระบบ`);
    return user;
}

async function getPackageOrFail(pkgId: number) {
    const pkg = await prisma.package.findUnique({
        where: { id: pkgId },
        include: { community: true, location: true, packageFile: true },
    });
    if (!pkg) throw new Error(`Package ID ${pkgId} ไม่พบในระบบ`);
    return pkg;
}

function ensureValidRole(role: string) {
    const allowed = ["superadmin", "admin", "member", "tourist"];
    if (!allowed.includes(role)) throw new Error("invalid role");
}

/* ============================================================================================
 * PERMISSION CHECKS (ใช้ string role + runtime guards)
 * ============================================================================================ */
async function assertCreatePermission(role: string, currentUserId: number, data: PackageDto) {
    ensureValidRole(role);
    const user = await getUserOrFail(currentUserId);

    // ตามตรรกะเดิม: ใช้ overseerMemberId (ถ้าไม่มาก็ใช้ currentUserId) เพื่อ resolve community
    const refUserId = data.overseerMemberId ?? currentUserId;
    const refUser = await prisma.user.findUnique({
        where: { id: Number(refUserId) },
        include: { memberOf: true },
    });
    if (!refUser) throw new Error(`User ID ${refUserId} ไม่พบในระบบ`);
    const resolvedCommunityId = refUser.memberOf?.id;
    if (!resolvedCommunityId) {
        throw new Error("ผู้ใช้นี้ไม่ได้สังกัดชุมชนใด จึงไม่สามารถสร้างแพ็กเกจได้");
    }

    switch (role) {
        case "superadmin":
            return;
        case "admin": {
            const adminCommunityIds = user.communitiesAdmin.map((c) => c.id);
            if (!adminCommunityIds.includes(resolvedCommunityId)) {
                throw new Error("คุณไม่มีสิทธิ์สร้าง Package ให้ชุมชนนี้");
            }
            return;
        }
        case "member": {
            if (!user.memberOf?.id || user.memberOf.id !== resolvedCommunityId) {
                throw new Error("คุณไม่มีสิทธิ์สร้าง Package นอกชุมชนของตน");
            }
            if (data.overseerMemberId && data.overseerMemberId !== user.id) {
                throw new Error("member ต้องเป็น overseer ของแพ็กเกจตนเอง");
            }
            return;
        }
        default:
            throw new Error("คุณไม่มีสิทธิ์สร้าง Package");
    }
}

async function assertEditPermission(role: string, currentUserId: number, pkgId: number) {
    ensureValidRole(role);
    const user = await getUserOrFail(currentUserId);
    const pkg = await getPackageOrFail(pkgId);

    switch (role) {
        case "superadmin":
            return;
        case "admin": {
            const adminCommunityIds = user.communitiesAdmin.map((c) => c.id);
            if (!adminCommunityIds.includes(pkg.communityId)) {
                throw new Error("คุณไม่มีสิทธิ์แก้ไข Package ของชุมชนนี้");
            }
            return;
        }
        case "member": {
            if (pkg.overseerMemberId !== user.id) {
                throw new Error("คุณไม่มีสิทธิ์แก้ไข Package นี้ (ไม่ใช่ผู้ดูแล)");
            }
            return;
        }
        default:
            throw new Error("คุณไม่มีสิทธิ์แก้ไข Package");
    }
}

async function assertDeletePermission(role: string, currentUserId: number, pkgId: number) {
    ensureValidRole(role);
    const user = await getUserOrFail(currentUserId);
    const pkg = await getPackageOrFail(pkgId);

    switch (role) {
        case "superadmin":
            return;
        case "admin": {
            const adminCommunityIds = user.communitiesAdmin.map((c) => c.id);
            if (!adminCommunityIds.includes(pkg.communityId)) {
                throw new Error("คุณไม่มีสิทธิ์ลบ Package ของชุมชนอื่น");
            }
            return;
        }
        case "member": {
            if (pkg.overseerMemberId !== user.id) {
                throw new Error("คุณไม่มีสิทธิ์ลบ Package ที่คุณไม่ได้ดูแล");
            }
            return;
        }
        default:
            throw new Error("คุณไม่มีสิทธิ์ลบ Package");
    }
}

async function createPackageCore(data: PackageDto, currentUserId?: number) {
    const raw = (data as any).communityId;
    const incomingCommunityId =
        raw === undefined || raw === null || raw === "" || Number(raw) <= 0 ? undefined : Number(raw);

    const refUserId = data.overseerMemberId ?? currentUserId;
    if (!refUserId) throw new Error("ไม่พบรหัสผู้ดูแล (overseerMemberId)");
    const user = await prisma.user.findUnique({
        where: { id: Number(refUserId) },
        include: { memberOf: true },
    });
    if (!user) throw new Error(`User ID ${refUserId} ไม่พบในระบบ`);

    const resolvedCommunityId = user.memberOf?.id;
    if (!resolvedCommunityId) {
        throw new Error("ผู้ใช้นี้ไม่ได้สังกัดชุมชนใด จึงไม่สามารถสร้างแพ็กเกจได้");
    }

    if (incomingCommunityId !== undefined && incomingCommunityId !== resolvedCommunityId) {
        throw new Error(
            `communityId ที่ส่งมา (${incomingCommunityId}) ไม่ตรงกับชุมชนของผู้ใช้ (${resolvedCommunityId})`
        );
    }

    const overseer = await prisma.user.findUnique({
        where: { id: Number(data.overseerMemberId) },
    });
    if (!overseer) throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);

    const location = await prisma.location.create({
        data: {
            houseNumber: data.location.houseNumber,
            villageNumber: data.location.villageNumber ?? null,
            subDistrict: data.location.subDistrict,
            district: data.location.district,
            province: data.location.province,
            postalCode: data.location.postalCode,
            detail: data.location.detail ?? null,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
        },
    });

    // ========= NEW: compose booking window & event window =========
    const startAt = composeDateTimeIso(data.startDate, (data as any).startTime);
    const dueAt = composeDateTimeIso(data.dueDate, (data as any).endTime, true);

    const openAt = composeDateTimeIso((data as any).openBookingAt, (data as any).openTime);
    const closeAt = composeDateTimeIso((data as any).closeBookingAt, (data as any).closeTime, true);

    // กฎเวลาเบื้องต้นให้ชัดเคสพลาด
    if (openAt > closeAt) {
        throw new Error("ช่วงเปิดจองไม่ถูกต้อง: openBookingAt ต้องไม่ช้ากว่า closeBookingAt");
    }
    if (closeAt > dueAt) {
        // ปกติควรปิดจองก่อนหรือพร้อมวันสิ้นสุดกิจกรรม
        throw new Error("closeBookingAt ต้องไม่ช้ากว่า dueDate ของแพ็กเกจ");
    }

    return prisma.package.create({
        data: {
            communityId: resolvedCommunityId,
            locationId: location.id,
            overseerMemberId: Number(data.overseerMemberId),
            createById: data.createById ?? currentUserId ?? Number(data.overseerMemberId),
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            price: data.price,
            warning: (data as any).warning ?? null,
            statusPackage: data.statusPackage,
            statusApprove: data.statusApprove,
            startDate: startAt,
            dueDate: dueAt,
            openBookingAt: openAt,
            closeBookingAt: closeAt,

            facility: (data as any).facility ?? null,
            ...(Array.isArray((data as any).packageFile) && (data as any).packageFile.length > 0
                ? {
                    packageFile: {
                        create: (data as any).packageFile.map((f: PackageFileDto) => ({
                            filePath: f.filePath,
                            type: f.type,
                        })),
                    },
                }
                : {}),
        },
        include: { location: true, packageFile: true },
    });
}


async function editPackageCore(id: number, data: PackageDto) {
    const packageExist = await prisma.package.findUnique({
        where: { id },
        include: { location: true, packageFile: true },
    });
    if (!packageExist) throw new Error(`Package ID ${id} ไม่พบในระบบ`);

    if (data.communityId) {
        const community = await prisma.community.findUnique({ where: { id: data.communityId } });
        if (!community) throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
    }

    if (data.overseerMemberId) {
        const overseer = await prisma.user.findUnique({ where: { id: data.overseerMemberId } });
        if (!overseer) throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);
    }

    // ========= NEW: recompute windows from incoming payload =========
    const startAt = composeDateTimeIso((data as any).startDate, (data as any).startTime);
    const dueAt = composeDateTimeIso((data as any).dueDate, (data as any).endTime, true);

    const hasOpenClose =
        (data as any).openBookingAt !== undefined || (data as any).closeBookingAt !== undefined;

    // ใช้ค่าจาก payload ถ้ามี ไม่งั้นคงค่าของเดิม
    const openAt = (data as any).openBookingAt
        ? composeDateTimeIso((data as any).openBookingAt, (data as any).openTime)
        : packageExist.openBookingAt;

    const closeAt = (data as any).closeBookingAt
        ? composeDateTimeIso((data as any).closeBookingAt, (data as any).closeTime, true)
        : packageExist.closeBookingAt;

    if (hasOpenClose) {
        if (openAt > closeAt) {
            throw new Error("ช่วงเปิดจองไม่ถูกต้อง: openBookingAt ต้องไม่ช้ากว่า closeBookingAt");
        }
        if (closeAt > dueAt) {
            throw new Error("closeBookingAt ต้องไม่ช้ากว่า dueDate ของแพ็กเกจ");
        }
    }

    const { location, packageFile } = data as any;

    const result = await prisma.package.update({
        where: { id },
        data: {
            ...(data.communityId && { community: { connect: { id: data.communityId } } }),
            ...(data.overseerMemberId && { overseerPackage: { connect: { id: data.overseerMemberId } } }),
            name: (data as any).name,
            description: (data as any).description,
            capacity: (data as any).capacity,
            price: (data as any).price,
            warning: (data as any).warning,
            startDate: startAt,
            dueDate: dueAt,

            // ========= NEW: update booking window (คงค่าเดิมถ้าไม่ได้ส่งมา) =========
            openBookingAt: openAt,
            closeBookingAt: closeAt,

            facility: (data as any).facility,
            ...(location && {
                location: {
                    update: {
                        houseNumber: location.houseNumber,
                        villageNumber: location.villageNumber ?? null,
                        subDistrict: location.subDistrict,
                        district: location.district,
                        province: location.province,
                        postalCode: location.postalCode,
                        detail: location.detail,
                        latitude: location.latitude,
                        longitude: location.longitude,
                    },
                },
            }),
            ...(packageFile && {
                packageFile: {
                    deleteMany: {},
                    create: (packageFile as PackageFileDto[]).map((file) => ({
                        filePath: file.filePath,
                        type: file.type,
                    })),
                },
            }),
        },
        include: { location: true, packageFile: true },
    });

    return result;
}


function buildWhereForRole(user: any): any {
    switch (user?.role?.name) {
        case "superadmin":
            return { isDeleted: false };
        case "admin": {
            const adminCommunityIds = user.communitiesAdmin.map((c: any) => c.id);
            return { communityId: { in: adminCommunityIds }, isDeleted: false };
        }
        case "member":
            return { overseerMemberId: user.id, isDeleted: false };
        case "tourist":
            return { statusApprove: "APPROVE", statusPackage: "PUBLISH", isDeleted: false };
        default:
            // empty condition ให้หาไม่เจออะไร
            return { id: -1 };
    }
}

async function getPackagesCore(
    whereCondition: any,
    page = 1,
    limit = 10
): Promise<PaginationResponse<any>> {
    const skip = (page - 1) * limit;

    const totalCount = await prisma.package.count({ where: whereCondition });

    const packages = await prisma.package.findMany({
        where: whereCondition,
        include: {
            community: true,
            location: true,
            overseerPackage: {
                select: { id: true, username: true, fname: true, lname: true, email: true },
            },
        },
        skip,
        take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);
    return {
        data: packages,
        pagination: { currentPage: page, totalPages, totalCount, limit },
    };
}

async function deletePackageCore(pkgId: number) {
    const deleted = await prisma.package.update({
        where: { id: pkgId },
        data: {
            isDeleted: true,
            deleteAt: new Date(),
        },
    });
    return deleted;
}

export async function createPackageBySuperAdmin(data: PackageDto, currentUserId: number) {
    await assertCreatePermission("superadmin", currentUserId, data);
    return createPackageCore(data, currentUserId);
}
export async function createPackageByAdmin(data: PackageDto, currentUserId: number) {
    await assertCreatePermission("admin", currentUserId, data);
    return createPackageCore(data, currentUserId);
}
export async function createPackageByMember(data: PackageDto, currentUserId: number) {
    await assertCreatePermission("member", currentUserId, data);
    return createPackageCore(data, currentUserId);
}

export async function editPackageBySuperAdmin(id: number, data: PackageDto, currentUserId: number) {
    await assertEditPermission("superadmin", currentUserId, id);
    return editPackageCore(id, data);
}
export async function editPackageByAdmin(id: number, data: PackageDto, currentUserId: number) {
    await assertEditPermission("admin", currentUserId, id);
    return editPackageCore(id, data);
}
export async function editPackageByMember(id: number, data: PackageDto, currentUserId: number) {
    await assertEditPermission("member", currentUserId, id);
    return editPackageCore(id, data);
}

export async function deletePackageBySuperAdmin(currentUserId: number, packageId: number) {
    await assertDeletePermission("superadmin", currentUserId, packageId);
    return deletePackageCore(packageId);
}
export async function deletePackageByAdmin(currentUserId: number, packageId: number) {
    await assertDeletePermission("admin", currentUserId, packageId);
    return deletePackageCore(packageId);
}
export async function deletePackageByMember(currentUserId: number, packageId: number) {
    await assertDeletePermission("member", currentUserId, packageId);
    return deletePackageCore(packageId);
}

export async function getPackagesBySuperAdmin(
    currentUserId: number,
    page = 1,
    limit = 10
): Promise<PaginationResponse<any>> {
    const user = await getUserOrFail(currentUserId);
    return getPackagesCore(buildWhereForRole({ ...user, role: { name: "superadmin" } }), page, limit);
}

export async function getPackagesByAdmin(
    currentUserId: number,
    page = 1,
    limit = 10
): Promise<PaginationResponse<any>> {
    const user = await getUserOrFail(currentUserId);
    return getPackagesCore(buildWhereForRole(user), page, limit);
}

export async function getPackagesByMember(
    currentUserId: number,
    page = 1,
    limit = 10
): Promise<PaginationResponse<any>> {
    const user = await getUserOrFail(currentUserId);
    return getPackagesCore(buildWhereForRole(user), page, limit);
}

export async function getPackagesByTourist(
    currentUserId: number,
    page = 1,
    limit = 10
): Promise<PaginationResponse<any>> {
    const user = await getUserOrFail(currentUserId);
    return getPackagesCore(buildWhereForRole({ ...user, role: { name: "tourist" } }), page, limit);
}