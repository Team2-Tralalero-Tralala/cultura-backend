// Services/package/package-service.ts
import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";
import type { PackageDto, PackageFileDto } from "./package-dto.js";

/* ============================================================================================
 * Helpers (เก็บเฉพาะที่จำเป็น)
 * ============================================================================================ */
const toNull = <T>(v: T | undefined | null): T | null => (v ?? null);

/** where เฉพาะ role + ซ่อนของที่ลบแล้ว (isDeleted = false) */
function buildWhereForRole(user: any): any {
    const base = { isDeleted: false };
    switch (user?.role?.name) {
        case "superadmin":
            return base;
        case "admin": {
            const adminCommunityIds = user.communityAdmin.map((c: any) => c.id);
            return { ...base, communityId: { in: adminCommunityIds } };
        }
        case "member":
            return { ...base, overseerMemberId: user.id };
        case "tourist":
            return { ...base, statusApprove: "APPROVE", statusPackage: "PUBLISH" };
        default:
            // หาไม่เจออะไร
            return { id: -1 };
    }
}

function composeDateTimeIso(
    dateStr: string,              // "yyyy-mm-dd"
    timeStr?: string,             // "HH:mm"
    useEndOfDayIfMissing = false
): Date {
    if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        throw new Error(`Invalid dateStr: ${dateStr}`);
    }

    const hhmm = (timeStr && /^\d{2}:\d{2}$/.test(timeStr))
        ? timeStr
        : (useEndOfDayIfMissing ? "23:59" : "00:00");

    // ทำเป็น "YYYY-MM-DDTHH:mm:ss" (ไม่มี Z ⇒ ตีความเป็น local)
    const isoLocal = `${dateStr}T${hhmm}:${useEndOfDayIfMissing && !timeStr ? "59" : "00"}`;
    return new Date(isoLocal);
}

/* ============================================================================================
 * Create
 * ============================================================================================ */
export const createPackage = async (data: PackageDto) => {
    // ตรวจ community (ถ้ามีส่งมา)
    if (data.communityId !== undefined && data.communityId !== null) {
        const community = await prisma.community.findUnique({
            where: { id: Number(data.communityId) },
        });
        if (!community) throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
    }

    // ตรวจ overseer
    const overseer = await prisma.user.findUnique({
        where: { id: Number(data.overseerMemberId) },
        include: { Community: true },
    });
    if (!overseer) throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);

    // ถ้าไม่ได้ส่ง communityId ให้อนุมานจากชุมชนของ overseer
    const resolvedCommunityId =
        data.communityId ?? overseer.Community?.id ?? null;
    if (!resolvedCommunityId) {
        throw new Error("ไม่พบชุมชนของผู้ดูแล แพ็กเกจต้องสังกัดชุมชน");
    }

    // สร้าง Location
    const location = await prisma.location.create({
        data: {
            houseNumber: data.location.houseNumber,
            villageNumber: toNull(data.location.villageNumber),
            alley: toNull(data.location.alley),
            subDistrict: data.location.subDistrict,
            district: data.location.district,
            province: data.location.province,
            postalCode: data.location.postalCode,
            detail: toNull(data.location.detail),
            latitude: data.location.latitude,
            longitude: data.location.longitude,
        },
    });

    // จัดการวันเวลาเริ่ม-สิ้นสุด (รองรับ startTime/endTime ถ้ามี)
    const startAt = composeDateTimeIso(data.startDate, (data as any).startTime);
    const dueAt = composeDateTimeIso(data.dueDate, (data as any).endTime, true);

    const openBooking = data.bookingOpenDate
        ? composeDateTimeIso(data.bookingOpenDate, (data as any).openTime)
        : null;

    const closeBooking = data.bookingCloseDate
        ? composeDateTimeIso(data.bookingCloseDate, (data as any).closeTime, true)
        : null;
    // NOTE: schema ใช้ bookingOpenDate/bookingCloseDate
    // ใน DTO สร้างยังไม่มี field เปิด/ปิดจอง → ไม่ set (คงเป็น null)
    return prisma.package.create({
        data: {
            communityId: Number(resolvedCommunityId),
            locationId: location.id,
            overseerMemberId: Number(data.overseerMemberId),
            createById: data.createById ?? Number(data.overseerMemberId),
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            price: data.price,
            warning: data.warning,
            statusPackage: data.statusPackage,
            statusApprove: data.statusApprove,
            startDate: startAt,
            dueDate: dueAt,
            bookingOpenDate: openBooking,
            bookingCloseDate: closeBooking,
            facility: data.facility,
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
};

/* ============================================================================================
 * Edit (อัปเดตเฉพาะสิ่งที่ส่งมา, กัน undefined)
 * ============================================================================================ */
/* ============================================================================================
 * Edit (อัปเดตเฉพาะสิ่งที่ส่งมา, กัน undefined)
 * ============================================================================================ */
export const editPackage = async (id: number, data: any) => {
    const pkg = await prisma.package.findUnique({
        where: { id },
        include: { location: true, packageFile: true },
    });
    if (!pkg) throw new Error(`Package ID ${id} ไม่พบในระบบ`);

    if (data.communityId !== undefined && data.communityId !== null) {
        const community = await prisma.community.findUnique({
            where: { id: Number(data.communityId) },
        });
        if (!community) throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
    }
    if (data.overseerMemberId !== undefined && data.overseerMemberId !== null) {
        const overseer = await prisma.user.findUnique({
            where: { id: Number(data.overseerMemberId) },
        });
        if (!overseer) throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);
    }

    // recompute วัน-เวลา (Package)
    const startAt =
        data.startDate
            ? composeDateTimeIso(data.startDate, data.startTime)
            : pkg.startDate;

    const dueAt =
        data.dueDate
            ? composeDateTimeIso(data.dueDate, data.endTime, true)
            : pkg.dueDate;

    const openBooking =
        data.bookingOpenDate
            ? composeDateTimeIso(data.bookingOpenDate, data.openTime)
            : pkg.bookingOpenDate;

    const closeBooking =
        data.bookingCloseDate
            ? composeDateTimeIso(data.bookingCloseDate, data.closeTime, true)
            : pkg.bookingCloseDate;

    // [เพิ่ม] แปลงวันเวลาของ Homestay (ถ้ามี)
    const homestayCheckIn = (data.homestayId && data.homestayCheckInDate)
        ? composeDateTimeIso(data.homestayCheckInDate, data.homestayCheckInTime)
        : undefined;

    const homestayCheckOut = (data.homestayId && data.homestayCheckOutDate)
        ? composeDateTimeIso(data.homestayCheckOutDate, data.homestayCheckOutTime, true)
        : undefined;

    const hasHomestayLink = data.homestayId && homestayCheckIn && homestayCheckOut && data.bookedRoom;

    const updateData: any = {
        ...(data.communityId !== undefined && { community: { connect: { id: Number(data.communityId) } } }),
        ...(data.overseerMemberId !== undefined && { overseerPackage: { connect: { id: Number(data.overseerMemberId) } } }),

        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.capacity !== undefined && { capacity: Number(data.capacity) }),
        ...(data.price !== undefined && { price: Number(data.price) }),
        ...(data.warning !== undefined && { warning: data.warning }),
        ...(data.statusPackage !== undefined && { statusPackage: data.statusPackage }),
        ...(data.statusApprove !== undefined && { statusApprove: data.statusApprove }),
        ...(startAt !== undefined && { startDate: startAt }),
        ...(dueAt !== undefined && { dueDate: dueAt }),
        ...(data.facility !== undefined && { facility: data.facility }),
        ...(data.bookingOpenDate !== undefined && { bookingOpenDate: openBooking }),
        ...(data.bookingCloseDate !== undefined && { bookingCloseDate: closeBooking }),
    };

    // อัปเดต location เฉพาะส่งมา
    if (data.location) {
        const loc = data.location;
        updateData.location = {
            update: {
                ...(loc.houseNumber !== undefined && { houseNumber: loc.houseNumber }),
                ...(loc.villageNumber !== undefined && { villageNumber: toNull(loc.villageNumber) }),
                ...(loc.alley !== undefined && { alley: toNull(loc.alley) }),
                ...(loc.subDistrict !== undefined && { subDistrict: loc.subDistrict }),
                ...(loc.district !== undefined && { district: loc.district }),
                ...(loc.province !== undefined && { province: loc.province }),
                ...(loc.postalCode !== undefined && { postalCode: loc.postalCode }),
                ...(loc.detail !== undefined && { detail: toNull(loc.detail) }),
                ...(loc.latitude !== undefined && { latitude: Number(loc.latitude) }),
                ...(loc.longitude !== undefined && { longitude: Number(loc.longitude) }),
            },
        };
    }

    // อัปเดตไฟล์แบบ replace เฉพาะเมื่อส่งมา
    if (Array.isArray(data.packageFile)) {
        updateData.packageFile = {
            deleteMany: {},
            create: (data.packageFile as PackageFileDto[]).map((file) => ({
                filePath: file.filePath,
                type: file.type,
            })),
        };
    }

    // [เพิ่ม] Logic การอัปเดต Homestay (แบบลบของเก่า-สร้างใหม่)
    // เราใช้ 'data.homestayId !== undefined' เพื่อเช็กว่ามีการส่งข้อมูลส่วนนี้มา
    if (data.homestayId !== undefined) {
        updateData.homestayHistories = {
            deleteMany: {}, // ลบประวัติ Homestay ที่ผูกกับ Package นี้ทั้งหมด
            ...(hasHomestayLink // ถ้าข้อมูลใหม่ครบถ้วน (มี ID, วันที่, ห้อง)
                ? {
                    create: { // สร้างประวัติใหม่
                        homestayId: Number(data.homestayId),
                        bookedRoom: Number(data.bookedRoom),
                        checkInTime: homestayCheckIn!,
                        checkOutTime: homestayCheckOut!,
                    },
                }
                : {}), // ถ้าข้อมูลไม่ครบ (เช่น กดลบ Homestay) ก็จะไม่สร้างใหม่
        };
    }

    return prisma.package.update({
        where: { id },
        data: updateData,
        include: { location: true, packageFile: true, homestayHistories: true },
    });
};

/* ============================================================================================
 * Get list by role (ใช้ userId จาก token ฝั่ง controller)
 * ============================================================================================ */
export const getPackageByRole = async (
    userId: number,
    page = 1,
    limit = 10
): Promise<PaginationResponse<any>> => {
    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        include: { role: true, Community: true, communityAdmin: true },
    });
    if (!user) throw new Error(`Member ID ${userId} ไม่ถูกต้อง`);

    const whereCondition = buildWhereForRole(user);

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
};

/* ============================================================================================
 * Soft delete (เช็คสิทธิ์แบบง่ายตาม role)
 * ============================================================================================ */
export const deletePackage = async (currentUserId: number, packageId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(currentUserId) },
        include: { role: true, communityAdmin: true },
    });
    if (!user) throw new Error(`User ID ${currentUserId} ไม่พบในระบบ`);

    const pkg = await prisma.package.findUnique({
        where: { id: Number(packageId) },
    });
    if (!pkg) throw new Error(`Package ID ${packageId} ไม่พบในระบบ`);

    const role = user.role?.name;
    if (role === "admin") {
        const adminCommunityIds = user.communityAdmin.map((c) => c.id);
        if (!adminCommunityIds.includes(pkg.communityId)) {
            throw new Error("คุณไม่มีสิทธิ์ลบ Package ของชุมชนอื่น");
        }
    } else if (role === "member") {
        if (pkg.overseerMemberId !== user.id) {
            throw new Error("คุณไม่มีสิทธิ์ลบ Package ที่คุณไม่ได้ดูแล");
        }
    } else if (role !== "superadmin") {
        throw new Error("คุณไม่มีสิทธิ์ลบ Package");
    }

    // soft delete
    return prisma.package.update({
        where: { id: Number(packageId) },
        data: { isDeleted: true, deleteAt: new Date() },
    });
};

/* ============================================================================================
 * Detail
 * ============================================================================================ */
export const getPackageDetailById = async (id: number) => {
    return prisma.package.findUnique({
        where: { id: Number(id) },
        include: {
            createPackage: { select: { id: true, fname: true, lname: true } },
            overseerPackage: { select: { id: true, fname: true, lname: true } },
            tagPackages: {
                include: { tag: { select: { id: true, name: true } } },
            },
            packageFile: { select: { id: true, filePath: true, type: true } },
            location: {
                select: {
                    id: true,
                    detail: true,
                    houseNumber: true,
                    villageNumber: true,
                    alley: true,
                    subDistrict: true,
                    district: true,
                    province: true,
                    postalCode: true,
                    latitude: true,
                    longitude: true,
                },
            },
            homestayHistories: {
                include: {
                    homestay: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            guestPerRoom: true,
                            totalRoom: true,
                            facility: true,
                            homestayImage: { select: { id: true, image: true, type: true } },
                            location: {
                                select: {
                                    detail: true,
                                    subDistrict: true,
                                    district: true,
                                    province: true,
                                    latitude: true,
                                    longitude: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

// ===== เพิ่มต่อจากท้ายไฟล์ package-service.ts =====

// Create (delegate)
export const createPackageBySuperAdmin = (data: PackageDto, _uid: number) =>
    createPackage(data);
export const createPackageByAdmin = (data: PackageDto, _uid: number) =>
    createPackage(data);
export const createPackageByMember = (data: PackageDto, _uid: number) =>
    createPackage(data);

// Edit (delegate)
export const editPackageBySuperAdmin = (id: number, data: any, _uid: number) =>
    editPackage(id, data);
export const editPackageByAdmin = (id: number, data: any, _uid: number) =>
    editPackage(id, data);
export const editPackageByMember = (id: number, data: any, _uid: number) =>
    editPackage(id, data);

// Delete (delegate)
export const deletePackageBySuperAdmin = (uid: number, packageId: number) =>
    deletePackage(uid, packageId);
export const deletePackageByAdmin = (uid: number, packageId: number) =>
    deletePackage(uid, packageId);
export const deletePackageByMember = (uid: number, packageId: number) =>
    deletePackage(uid, packageId);

// List (delegate ไปยัง getPackageByRole; role ถูกตรวจจาก user ใน DB อยู่แล้ว)
export const getPackagesBySuperAdmin = (uid: number, page = 1, limit = 10) =>
    getPackageByRole(uid, page, limit);
export const getPackagesByAdmin = (uid: number, page = 1, limit = 10) =>
    getPackageByRole(uid, page, limit);
export const getPackagesByMember = (uid: number, page = 1, limit = 10) =>
    getPackageByRole(uid, page, limit);
export const getPackagesByTourist = (uid: number, page = 1, limit = 10) =>
    getPackageByRole(uid, page, limit);


type ListByPackageInput = {
    userId: number;
    packageId: number;
    q?: string;
    limit?: number;
};

export async function listHomestaysByPackage({
    userId, packageId, q = "", limit = 8,
}: ListByPackageInput) {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user");
    if (!Number.isInteger(packageId) || packageId <= 0) throw new Error("Invalid packageId");

    const me = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!me) throw new Error("User not found");

    const pkg = await prisma.package.findFirst({
        where: { id: packageId, isDeleted: false },
        select: { communityId: true },
    });
    if (!pkg) throw new Error("Package not found");
    if (!pkg.communityId) throw new Error("Package has no community");

    const nameFilter = q.trim()
        ? { name: { contains: q.trim() } }
        : undefined;

    const homestays = await prisma.homestay.findMany({
        where: {
            communityId: pkg.communityId,
            isDeleted: false,
            ...(nameFilter ? { OR: [nameFilter] } : {}),
        },
        select: {
            id: true,
            name: true,
            facility: true,
            homestayImage: { select: { image: true } },
        },
        orderBy: [{ name: "asc" }],
        take: Math.max(1, Math.min(50, Number(limit) || 8)),
    });

    return homestays;
}

export async function updatePackageTags(packageId: number, tagIds: number[]) {
    const pid = Number(packageId);
    const ids = (tagIds ?? [])
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n > 0);

    // ลบความเชื่อมเดิมทั้งหมดของแพ็กเกจนี้ก่อน
    await prisma.tagsPackages.deleteMany({ where: { packageId: pid } });

    // สร้างความเชื่อมใหม่ (แทนที่ทั้งชุด)
    if (ids.length > 0) {
        await prisma.tagsPackages.createMany({
            data: ids.map((tagId) => ({ packageId: pid, tagId })),
            skipDuplicates: true, // แนะนำให้มี unique composite ที่ (packageId, tagId)
        });
    }
}

type ListHomestaysInput = { userId: number; q?: string; limit?: number };

export async function listCommunityHomestays({ userId, q = "", limit = 8 }: ListHomestaysInput) {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user");

    const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: { select: { name: true } }, communityId: true },
    });
    if (!me) throw new Error("User not found");
    if (!me.communityId) throw new Error("User has no community");

    const qTrim = q.trim();
    const or = qTrim ? [{ name: { contains: qTrim } }] : [];

    const homestays = await prisma.homestay.findMany({
        where: {
            communityId: me.communityId,
            isDeleted: false,
            ...(or.length ? { OR: or } : {}),
        },
        select: { id: true, name: true, facility: true, homestayImage: { select: { image: true } } },
        orderBy: [{ name: "asc" }],
        take: Math.max(1, Math.min(50, Number(limit) || 8)),
    });

    return homestays;
}

export async function getCommunityMembersAndAdmin(
    communityId: number,
    q?: string,
    limit = 50
) {
    if (!Number.isInteger(communityId) || communityId <= 0) {
        throw new Error("ID must be Number");
    }

    const community = await prisma.community.findFirst({
        where: { id: communityId, isDeleted: false },
        select: { id: true, adminId: true },
    });
    if (!community) throw new Error("Community not found");

    const admin =
        community.adminId != null
            ? await prisma.user.findFirst({
                where: {
                    id: community.adminId,
                    isDeleted: false,
                    role: { name: "admin" },
                },
                select: { id: true, fname: true, lname: true }, // ขนาดเล็กพอสำหรับ selector
            })
            : null;

    const nameFilter =
        q && q.trim()
            ? {
                OR: [
                    { fname: { contains: q.trim(), mode: "insensitive" } },
                    { lname: { contains: q.trim(), mode: "insensitive" } },
                ],
            }
            : {};

    const members = await prisma.user.findMany({
        where: {
            isDeleted: false,
            role: { name: "member" },
            communityId: communityId,
            ...nameFilter,
        },
        select: { id: true, fname: true, lname: true },
        orderBy: [{ fname: "asc" }, { lname: "asc" }],
        take: Number.isFinite(limit) ? Number(limit) : 50,
    });

    return [
        ...(admin ? [admin] : []),
        ...members,
    ];
}

type ListAllHomestaysInput = {
    q?: string;
    limit?: number;
};

/**
 * [Super Admin] ดึง Homestays ทั้งหมดในระบบ (สำหรับ Superadmin)
 * - ใช้สำหรับ Route: /super/list-homestays
 */
export async function listAllHomestaysSuperAdmin({ q = "", limit = 8 }: ListAllHomestaysInput) {
    const qTrim = q.trim();
    const or = qTrim ? [{ name: { contains: qTrim, mode: "insensitive" } }] : [];

    const homestays = await prisma.homestay.findMany({
        where: {
            isDeleted: false,
            ...(or.length ? { OR: or } : {}),
        },
        select: {
            id: true,
            name: true,
            facility: true,
            homestayImage: {
                select: { image: true },
                where: { type: "COVER" }, // เลือกเฉพาะ Cover
                take: 1
            },
            community: { // แสดงว่าอยู่ชุมชนไหน
                select: { id: true, name: true }
            }
        },
        orderBy: [{ name: "asc" }],
        take: Math.max(1, Math.min(50, Number(limit) || 8)),
    });

    return homestays;
}