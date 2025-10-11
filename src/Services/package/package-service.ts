import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";
import type { PackageDto, PackageFileDto } from "./package-dto.js";
import { composeDateTimeIso } from "../../Libs/Types/package-type.js";

/*
 * คำอธิบาย : ฟังก์ชันสร้าง Package ใหม่ในระบบ
 * Input  : ข้อมูล PackageDto (communityId, overseerMemberId, location, name, ฯลฯ)
 * Output : ข้อมูล Package ที่ถูกสร้างใหม่
 */
// Services/package/package-service.ts
export const createPackage = async (data: PackageDto, currentUserId?: number) => {
    // --- sanitize communityId ที่เข้ามา (ตัดทิ้งถ้าเป็น "", 0, null) ---
    const raw = (data as any).communityId;
    const incomingCommunityId =
        raw === undefined || raw === null || raw === "" || Number(raw) <= 0
            ? undefined
            : Number(raw);

    // ใช้ overseerMemberId เป็นหลัก (ถ้าไม่มาก็ใช้ currentUserId)
    const refUserId = data.overseerMemberId ?? currentUserId;
    if (!refUserId) throw new Error("ไม่พบรหัสผู้ดูแล (overseerMemberId)");

    // ดึงชุมชนของผู้ใช้ (1 user ต่อ 1 ชุมชน -> memberOf)
    const user = await prisma.user.findUnique({
        where: { id: Number(refUserId) },
        include: { memberOf: true },
    });
    if (!user) throw new Error(`User ID ${refUserId} ไม่พบในระบบ`);

    const resolvedCommunityId = user.memberOf?.id;
    if (!resolvedCommunityId) {
        throw new Error("ผู้ใช้นี้ไม่ได้สังกัดชุมชนใด จึงไม่สามารถสร้างแพ็กเกจได้");
    }

    // ถ้า FE ส่ง communityId มาด้วยและเป็นเลขบวก → ต้องตรงกับของผู้ใช้เท่านั้น
    if (incomingCommunityId !== undefined && incomingCommunityId !== resolvedCommunityId) {
        throw new Error(
            `communityId ที่ส่งมา (${incomingCommunityId}) ไม่ตรงกับชุมชนของผู้ใช้ (${resolvedCommunityId})`
        );
    }

    // ตรวจสอบ overseer ว่ามีจริง
    const overseer = await prisma.user.findUnique({
        where: { id: Number(data.overseerMemberId) },
    });
    if (!overseer) throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);

    // สร้าง location
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

    const startAt = composeDateTimeIso(data.startDate, (data as any).startTime);
    const dueAt = composeDateTimeIso(data.dueDate, (data as any).endTime, true);
    // สร้าง package (ใช้ communityId ที่ resolve แล้วเสมอ)
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
            warning: data.warning ?? null,
            statusPackage: data.statusPackage,
            statusApprove: data.statusApprove,
            startDate: startAt,
            dueDate: dueAt,
            facility: data.facility ?? null,
            ...(Array.isArray(data.packageFile) && data.packageFile.length > 0
                ? {
                    packageFile: {
                        create: data.packageFile.map((f) => ({
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


/*
 * คำอธิบาย : ฟังก์ชันแก้ไขข้อมูล Package ที่มีอยู่
 * Input  : id (หมายเลข Package), data (ข้อมูล Package ที่แก้ไข)
 * Output : ข้อมูล Package ที่ถูกอัปเดต พร้อม location
 */
export const editPackage = async (id: number, data: any) => {
    // ตรวจสอบว่า package มีจริง
    const packageExist = await prisma.package.findUnique({
        where: { id },
        include: { location: true, packageFile: true }, // include packageFile ด้วย
    });
    if (!packageExist) {
        throw new Error(`Package ID ${id} ไม่พบในระบบ`);
    }

    // ตรวจสอบ communityId ถ้ามีการแก้ไข
    if (data.communityId) {
        const community = await prisma.community.findUnique({
            where: { id: data.communityId },
        });
        if (!community) {
            throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
        }
    }

    // ตรวจสอบ overseerMemberId ถ้ามีการแก้ไข
    if (data.overseerMemberId) {
        const overseer = await prisma.user.findUnique({
            where: { id: data.overseerMemberId },
        });
        if (!overseer) {
            throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);
        }
    }

    // แยก field ออกมา
    const { location, locationId, packageFile, ...packageData } = data;
    const startAt = composeDateTimeIso(data.startDate, data.startTime);
    const dueAt   = composeDateTimeIso(data.dueDate,   data.endTime, true);

    const result = await prisma.package.update({
        where: { id },
        data: {
            community: { connect: { id: data.communityId } },
            overseerPackage: { connect: { id: data.overseerMemberId } },
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            price: data.price,
            warning: data.warning,
            startDate: startAt, 
            dueDate: dueAt,
            facility: data.facility,

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

            // อัปเดต packageFile เฉพาะกรณีที่ส่งมา
            ...(packageFile && {
                packageFile: {
                    deleteMany: {},
                    create: packageFile.map((file: PackageFileDto) => ({
                        filePath: file.filePath,
                        type: file.type,
                    })),
                },
            }),
        },
        include: { location: true, packageFile: true },
    });

    return result;
};


/*
 * คำอธิบาย : ดึง Package ตามหมายเลข ID
 * Input  : id (หมายเลข Package)
 * Output : รายการ Package ที่พบ (อาจเป็น array)
 */
export const getPackageByRole = async (
    id: number,
    page: number = 1,
    limit: number = 10
): Promise<PaginationResponse<any>> => {
    if (isNaN(id)) {
        throw new Error(`Member ID ${id} ไม่ถูกต้อง`);
    }

    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
        where: { id },
        include: { role: true, memberOf: true, communitiesAdmin: true }
    });

    let whereCondition: any = {};

    switch (user?.role.name) {
        case "superadmin":
            // superadmin เห็นทั้งหมด
            whereCondition = {
                isDeleted: false,
            };
            break;

        case "admin":
            const adminCommunityIds = user.communitiesAdmin.map((c) => c.id);
            whereCondition = {
                communityId: { in: adminCommunityIds },
                isDeleted: false,
            };
            break;

        case "member":
            whereCondition = {
                overseerMemberId: user.id,
                isDeleted: false,
            };
            break;

        case "tourist":
            whereCondition = {
                statusApprove: "APPROVE",
                statusPackage: "PUBLISH",
                isDeleted: false,
            };
            break;

        default:
            return {
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalCount: 0,
                    limit,
                },
            };
    }

    const totalCount = await prisma.package.count({ where: whereCondition });

    const packages = await prisma.package.findMany({
        where: whereCondition,
        include: {
            community: true, location: true, overseerPackage: {
                select: { id: true, username: true, fname: true, lname: true, email: true },
            },
        },
        skip,
        take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
        data: packages,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
        },
    };
};


/*
 * คำอธิบาย : ลบ Package ออกจากระบบ
 * Input  : id (หมายเลข Package)
 * Output : ข้อมูล Package ที่ถูกลบ
 */
export const deletePackage = async (userId: number, packageId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, memberOf: true, communitiesAdmin: true },
    });

    if (!user) {
        throw new Error(`User ID ${userId} ไม่พบในระบบ`)
    }

    const packageExist = await prisma.package.findUnique({
        where: { id: packageId },
        include: { community: true }
    });

    if (!packageExist) {
        throw new Error(`Package ID ${packageId} ไม่พบในระบบ`);
    }
    switch (user.role.name) {
        case "superadmin":
            // superadmin ลบได้ทุกอย่าง
            break;
        case "admin":
            // admin ต้องเป็น admin ของ community นั้นเท่านั้น
            const adminCommunityIds = user.communitiesAdmin.map(c => c.id);

            if (!adminCommunityIds.includes(packageExist.communityId)) {
                throw new Error("คุณไม่มีสิทธิ์ลบ Package ของชุมชนอื่น");
            }

            break;
        case "member":
            // member ต้องเป็น overseer ของ package เท่านั้น
            if (packageExist.overseerMemberId !== user.id) {
                throw new Error("คุณไม่มีสิทธิ์ลบ Package ที่คุณไม่ได้ดูแล");
            }
            break;
        default:
            throw new Error("คุณไม่มีสิทธิ์ลบ Package");
    }
    const deleted = await prisma.package.update({
        where: { id: packageId },
        data: {
            isDeleted: true,
            deleteAt: new Date(),
        },
    });
    return deleted;
};

export const getPackageById = async (packageId: number, userId: number) => {
    if (isNaN(packageId)) throw new Error("Package ID ไม่ถูกต้อง");

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, communitiesAdmin: true },
    });
    if (!user) throw new Error(`User ID ${userId} ไม่พบในระบบ`);

    const pkg = await prisma.package.findUnique({
        where: { id: packageId },
        include: {
            community: true,
            location: true,
            overseerPackage: {
                select: { id: true, username: true, fname: true, lname: true, email: true },
            },
            packageFile: true,
        },
    });
    if (!pkg || pkg.isDeleted) throw new Error(`Package ID ${packageId} ไม่พบในระบบ`);

    const role = user.role?.name;

    // superadmin: ดูได้ทั้งหมด
    if (role === "superadmin") return pkg;

    // admin: ต้องเป็น admin ของ community นั้นเท่านั้น
    if (role === "admin") {
        const adminCommunityIds = user.communitiesAdmin.map((c) => c.id);
        if (!adminCommunityIds.includes(pkg.communityId)) {
            throw new Error("คุณไม่มีสิทธิ์เข้าถึง Package ของชุมชนนี้");
        }
        return pkg;
    }

    // member: ต้องเป็น overseer ของ package นี้
    if (role === "member") {
        if (pkg.overseerMemberId !== user.id) {
            throw new Error("คุณไม่มีสิทธิ์เข้าถึง Package นี้");
        }
        return pkg;
    }

    throw new Error("คุณไม่มีสิทธิ์เข้าถึง Package");
};
