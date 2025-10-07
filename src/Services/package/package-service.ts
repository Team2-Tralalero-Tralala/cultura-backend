import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";
import type { PackageDto, PackageFileDto } from "./package-dto.js";

/*
 * คำอธิบาย : ฟังก์ชันสร้าง Package ใหม่ในระบบ
 * Input  : ข้อมูล PackageDto (communityId, overseerMemberId, location, name, ฯลฯ)
 * Output : ข้อมูล Package ที่ถูกสร้างใหม่
 */
export const createPackage = async (data: PackageDto) => {
    // ตรวจสอบว่า community มีจริง
    const community = await prisma.community.findUnique({
        where: { id: data.communityId }
    });

    if (!community) {
        throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
    }

    // ตรวจสอบว่า overseerMemberId มีจริง
    const overseer = await prisma.user.findUnique({
        where: { id: data.overseerMemberId }
    });
    if (!overseer) {
        throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);
    }

    // สร้าง location ใหม่
    const location = await prisma.location.create({
        data: {
            houseNumber: data.location.houseNumber,
            subDistrict: data.location.subDistrict,
            district: data.location.district,
            province: data.location.province,
            postalCode: data.location.postalCode,
            detail: data.location.detail,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
        },
    });

    // สร้าง Package โดยผูกกับ location และเพิ่ม packageFile ถ้ามี
    return await prisma.package.create({
        data: {
            communityId: data.communityId,
            locationId: location.id,
            overseerMemberId: data.overseerMemberId,
            createById: data.createById,
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            price: data.price,
            warning: data.warning,
            statusPackage: data.statusPackage,
            statusApprove: data.statusApprove,
            startDate: new Date(data.startDate),
            dueDate: new Date(data.dueDate),
            facility: data.facility,

            // ใช้ conditional spread แทน undefined
            ...(data.packageFile && {
                packageFile: {
                    create: data.packageFile.map((file: any) => ({
                        filePath: file.filePath,
                        type: file.type,
                    })),
                },
            }),
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

    const result = await prisma.package.update({
        where: { id },
        data: {
            community: { connect: { id: data.communityId } },
            overseerPackage: { connect: { id: data.overseerMemberId } },
            createPackage: { connect: { id: data.createById } },

            name: data.name,
            description: data.description,
            capacity: data.capacity,
            price: data.price,
            warning: data.warning,
            statusPackage: data.statusPackage,
            statusApprove: data.statusApprove,
            startDate: new Date(data.startDate),
            dueDate: new Date(data.dueDate),
            facility: data.facility,

            location: {
                update: {
                    houseNumber: location.houseNumber,
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
        include: { community: true, location: true },
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
        include: { role: true, memberOf: true, communitiesAdmin: true},
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