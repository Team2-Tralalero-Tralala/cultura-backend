// Services/homestay/homestay-service.ts
import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";
import type { HomestayDto, HomestayImageDto } from "./homestay-dto.js";

/* ============================================================================================
 * UTIL HELPERS
 * ============================================================================================ */
async function getUserOrFail(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!user) throw new Error(`User ID ${userId} ไม่พบในระบบ`);
    return user;
}

async function getCommunityOrFail(communityId: number) {
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new Error(`Community ID ${communityId} ไม่พบในระบบ`);
    return community;
}

async function getHomestayOrFail(homestayId: number) {
    const hs = await prisma.homestay.findUnique({
        where: { id: homestayId },
        include: { location: true, homestayImage: true, community: true },
    });
    if (!hs) throw new Error(`Homestay ID ${homestayId} ไม่พบในระบบ`);
    return hs;
}

function ensureSuperAdmin(roleName?: string | null) {
    if (roleName?.toLowerCase() !== "superadmin") {
        throw new Error("คุณไม่มีสิทธิ์ดำเนินการ (ต้องเป็น SuperAdmin เท่านั้น)");
    }
}

/* ============================================================================================
 * CORE CUD (Create / Update / Delete)
 * ============================================================================================ */
async function createHomestayCore(communityId: number, data: HomestayDto) {
    // 1) ตรวจ community
    await getCommunityOrFail(communityId);

    // ก่อน: createHomestayCore (มี location: { create: ... })
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

    const result = await prisma.homestay.create({
        data: {
            communityId,
            // ❌ เอาอันนี้ออก: location: { create: { ... } }
            locationId: location.id, // ✅ ใส่อันนี้แทน
            name: data.name,
            type: data.type,
            guestPerRoom: data.guestPerRoom,
            totalRoom: data.totalRoom,
            facility: data.facility,
            ...(Array.isArray(data.homestayImage) && data.homestayImage.length > 0
                ? {
                    homestayImage: {
                        create: data.homestayImage.map((f) => ({
                            image: f.image,
                            type: f.type,
                        })),
                    },
                }
                : {}),
        },
        include: { location: true, homestayImage: true },
    });


    return result;
}

async function editHomestayCore(homestayId: number, data: Partial<HomestayDto> & { communityId?: number }) {
    const exist = await getHomestayOrFail(homestayId);

    // (option) ย้ายชุมชนได้ หากระบุมาและมีอยู่จริง
    if (data.communityId) {
        await getCommunityOrFail(Number(data.communityId));
    }

    const loc = (data as any).location;

    const result = await prisma.homestay.update({
        where: { id: homestayId },
        data: {
            ...(data.communityId && { community: { connect: { id: Number(data.communityId) } } }),
            ...(data.name !== undefined && { name: data.name }),
            ...(data.type !== undefined && { type: data.type }),
            ...(data.guestPerRoom !== undefined && { guestPerRoom: Number(data.guestPerRoom) }),
            ...(data.totalRoom !== undefined && { totalRoom: Number(data.totalRoom) }),
            ...(data.facility !== undefined && { facility: data.facility }),

            ...(loc && {
                location: {
                    update: {
                        houseNumber: loc.houseNumber,
                        villageNumber: loc.villageNumber ?? null,
                        subDistrict: loc.subDistrict,
                        district: loc.district,
                        province: loc.province,
                        postalCode: loc.postalCode,
                        detail: loc.detail ?? null,
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                    },
                },
            }),

            // ถ้าส่ง homestayImage มา ให้แทนที่ทั้งหมด
            ...(Array.isArray((data as any).homestayImage) && {
                homestayImage: {
                    deleteMany: {},
                    create: ((data as any).homestayImage as HomestayImageDto[]).map((f) => ({
                        image: f.image,
                        type: f.type,
                    })),
                },
            }),
        },
        include: { location: true, homestayImage: true },
    });

    return result;
}

/* ============================================================================================
 * PUBLIC APIS (เฉพาะ SuperAdmin)
 * ============================================================================================ */
export async function createHomestayBySuperAdmin(
    currentUserId: number,
    communityId: number,
    data: HomestayDto
) {
    const me = await getUserOrFail(currentUserId);
    ensureSuperAdmin(me.role?.name);
    return createHomestayCore(Number(communityId), data);
}


// รองรับสร้างหลายรายการ (สอดคล้องกับฝั่ง UI ที่เพิ่มหลายการ์ด)
// ก่อน: ใช้ $transaction([...homestay.create(...), ...]) ที่มี nested location
// หลัง: ใช้ interactive transaction + locationId
export async function createHomestaysBulkBySuperAdmin(
    currentUserId: number,
    communityId: number,
    dataList: HomestayDto[]
) {
    const me = await getUserOrFail(currentUserId);
    ensureSuperAdmin(me.role?.name);
    await getCommunityOrFail(Number(communityId));

    const results = await prisma.$transaction(async (tx) => {
        const created: any[] = [];
        for (const d of dataList) {
            const loc = await tx.location.create({
                data: {
                    houseNumber: d.location.houseNumber,
                    villageNumber: d.location.villageNumber ?? null,
                    subDistrict: d.location.subDistrict,
                    district: d.location.district,
                    province: d.location.province,
                    postalCode: d.location.postalCode,
                    detail: d.location.detail ?? null,
                    latitude: d.location.latitude,
                    longitude: d.location.longitude,
                },
            });

            const hs = await tx.homestay.create({
                data: {
                    communityId: Number(communityId),
                    locationId: loc.id, // ✅ ใช้ locationId
                    name: d.name,
                    type: d.type,
                    guestPerRoom: d.guestPerRoom,
                    totalRoom: d.totalRoom,
                    facility: d.facility,
                    ...(Array.isArray(d.homestayImage) && d.homestayImage.length > 0
                        ? {
                            homestayImage: {
                                create: d.homestayImage.map((f) => ({
                                    image: f.image,
                                    type: f.type,
                                })),
                            },
                        }
                        : {}),
                },
                include: { location: true, homestayImage: true },
            });

            created.push(hs);
        }
        return created;
    });

    return results;
}


export async function editHomestayBySuperAdmin(
    currentUserId: number,
    homestayId: number,
    data: Partial<HomestayDto> & { communityId?: number }
) {
    const me = await getUserOrFail(currentUserId);
    ensureSuperAdmin(me.role?.name);
    return editHomestayCore(Number(homestayId), data);
}


export async function getHomestaysBySuperAdmin(
    currentUserId: number,
    page = 1,
    limit = 10,
    opts?: { communityId?: number; q?: string }
): Promise<PaginationResponse<any>> {
    const me = await getUserOrFail(currentUserId);
    ensureSuperAdmin(me.role?.name);

    const where: any = { isDeleted: false };
    if (opts?.communityId) where.communityId = Number(opts.communityId);
    if (opts?.q) {
        // ค้นหาจากชื่อ/ประเภท
        where.OR = [
            { name: { contains: opts.q, mode: "insensitive" } },
            { type: { contains: opts.q, mode: "insensitive" } },
        ];
    }

    const skip = (page - 1) * limit;
    const totalCount = await prisma.homestay.count({ where });

    const homestays = await prisma.homestay.findMany({
        where,
        include: {
            community: { select: { id: true, name: true } },
            location: true,
            homestayImage: true,
        },
        orderBy: { id: "desc" },
        skip,
        take: limit,
    });

    return {
        data: homestays,
        pagination: { currentPage: page, totalPages: Math.ceil(totalCount / limit), totalCount, limit },
    };
}

export async function getHomestayDetailByIdBySuperAdmin(currentUserId: number, homestayId: number) {
    const me = await getUserOrFail(currentUserId);
    ensureSuperAdmin(me.role?.name);

    return prisma.homestay.findUnique({
        where: { id: Number(homestayId) },
        include: {
            community: { select: { id: true, name: true } },
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
            homestayImage: { select: { id: true, image: true, type: true } },
            tagHomestays: {
                include: { tag: { select: { id: true, name: true } } },
            },
        },
    });
}

export async function getHomestayDetailById(id: number) {
    return prisma.homestay.findUnique({
        where: { id },
        include: {
            community: {
                select: { id: true, name: true },
            },
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
            homestayImage: {
                select: { id: true, image: true, type: true },
            },
            // ถ้าใช้แท็กอยู่ ให้คงไว้ได้ (ไม่ใช้ก็ลบส่วนนี้ออกได้)
            tagHomestays: {
                include: {
                    tag: { select: { id: true, name: true } },
                },
            },
        },
    });
}
