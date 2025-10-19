import prisma from "../database-service.js";
import type { HomestayDto, HomestayImageDto } from "./homestay-dto.js";

/*
 * คำอธิบาย : ดึงผู้ใช้ตาม userId; ไม่พบให้ throw
 * Input  : userId:number
 * Output : user (พร้อม role) หรือ throw Error
 */
async function getUserOrFail(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!user) throw new Error(`User ID ${userId} ไม่พบในระบบ`);
    return user;
}

/*
 * คำอธิบาย : ดึง community ตาม communityId; ไม่พบให้ throw
 * Input  : communityId:number
 * Output : community หรือ throw Error
 */
async function getCommunityOrFail(communityId: number) {
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new Error(`Community ID ${communityId} ไม่พบในระบบ`);
    return community;
}

/*
 * คำอธิบาย : ดึง homestay ตาม homestayId (รวม location, homestayImage, community); ไม่พบให้ throw
 * Input  : homestayId:number
 * Output : homestay (include ความสัมพันธ์) หรือ throw Error
 */
async function getHomestayOrFail(homestayId: number) {
    const hs = await prisma.homestay.findUnique({
        where: { id: homestayId },
        include: { location: true, homestayImage: true, community: true },
    });
    if (!hs) throw new Error(`Homestay ID ${homestayId} ไม่พบในระบบ`);
    return hs;
}

/*
 * คำอธิบาย : ตรวจสิทธิ์ว่า role เป็น SuperAdmin; ไม่ใช่ให้ throw
 * Input  : roleName?:string|null
 * Output : void (throw เมื่อไม่ผ่าน)
 */
function ensureSuperAdmin(roleName?: string | null) {
    if (roleName?.toLowerCase() !== "superadmin") {
        throw new Error("คุณไม่มีสิทธิ์ดำเนินการ (ต้องเป็น SuperAdmin เท่านั้น)");
    }
}

/*
 * Helper : แปลง input ที่คาดว่าเป็นอาเรย์ของ tagIds ให้เป็น number[] ที่สะอาด
 */
function normalizeTagIdArray(input: unknown): number[] {
    if (!Array.isArray(input)) return [];
    const nums = input
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n) && n > 0) as number[];
    return Array.from(new Set(nums));
}

/*
 * คำอธิบาย : สร้าง Homestay พร้อม location (บันทึก location ก่อนแล้วอ้างอิงด้วย locationId)
 * Input  : communityId:number, data:HomestayDto
 * Output : homestay ที่ถูกสร้าง (include location, homestayImage, tagHomestays)
 */
async function createHomestayCore(communityId: number, data: HomestayDto) {
    await getCommunityOrFail(communityId);
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

    const tagIds = normalizeTagIdArray((data as any).tagHomestays);

    const result = await prisma.homestay.create({
        data: {
            communityId,
            locationId: location.id,
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
            ...(tagIds.length > 0
                ? {
                    tagHomestays: {
                        create: tagIds.map((tagId) => ({ tagId })),
                    },
                }
                : {}),
        },
        include: {
            location: true,
            homestayImage: true,
            tagHomestays: { include: { tag: true } },
        },
    });

    return result;
}

/*
 * คำอธิบาย : แก้ไข Homestay แบบ partial (รองรับเปลี่ยน community, อัปเดต location, แทนที่ homestayImage ทั้งชุด, อัปเดตแท็ก)
 * Input  : homestayId:number, data: Partial<HomestayDto> & { communityId?: number }
 * Output : homestay ที่อัปเดตแล้ว (include location, homestayImage, tagHomestays)
 */
async function editHomestayCore(
    homestayId: number,
    data: Partial<HomestayDto> & { communityId?: number }
) {
    await getHomestayOrFail(homestayId);

    if (data.communityId) {
        await getCommunityOrFail(Number(data.communityId));
    }

    const loc = (data as any).location;
    const tagIds = normalizeTagIdArray((data as any).tagHomestays);

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

            ...(Array.isArray((data as any).homestayImage) && {
                homestayImage: {
                    deleteMany: {},
                    create: ((data as any).homestayImage as HomestayImageDto[]).map((f) => ({
                        image: f.image,
                        type: f.type,
                    })),
                },
            }),

            ...(Array.isArray((data as any).tagHomestays) && {
                tagHomestays: {
                    deleteMany: {},
                    create: tagIds.map((tagId) => ({ tagId })),
                },
            }),
        },
        include: {
            location: true,
            homestayImage: true,
            tagHomestays: { include: { tag: true } },
        },
    });

    return result;
}

/*
 * คำอธิบาย : ตรวจสิทธิ์ SuperAdmin แล้วเรียกสร้าง Homestay (เดี่ยว)
 * Input  : currentUserId:number, communityId:number, data:HomestayDto
 * Output : homestay ที่ถูกสร้าง
 */
export async function createHomestayBySuperAdmin(
    currentUserId: number,
    communityId: number,
    data: HomestayDto
) {
    const me = await getUserOrFail(currentUserId);
    ensureSuperAdmin(me.role?.name);
    return createHomestayCore(Number(communityId), data);
}

/*
 * คำอธิบาย : ตรวจสิทธิ์ SuperAdmin แล้วสร้าง Homestay “หลายรายการ” ภายใต้ทรานแซคชัน
 * Input  : currentUserId:number, communityId:number, dataList:HomestayDto[]
 * Output : homestay[] ที่ถูกสร้างทั้งหมด
 */
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

            const tagIds = normalizeTagIdArray((d as any).tagHomestays);

            const hs = await tx.homestay.create({
                data: {
                    communityId: Number(communityId),
                    locationId: loc.id,
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
                    ...(tagIds.length > 0
                        ? {
                            tagHomestays: {
                                create: tagIds.map((tagId) => ({ tagId })),
                            },
                        }
                        : {}),
                },
                include: { location: true, homestayImage: true, tagHomestays: { include: { tag: true } } },
            });
            created.push(hs);
        }
        return created;
    });
    return results;
}

/*
 * คำอธิบาย : ตรวจสิทธิ์ SuperAdmin แล้วแก้ไข Homestay ตาม id
 * Input  : currentUserId:number, homestayId:number, data:Partial<HomestayDto> & { communityId?: number }
 * Output : homestay ที่อัปเดตแล้ว
 */
export async function editHomestayBySuperAdmin(
    currentUserId: number,
    homestayId: number,
    data: Partial<HomestayDto> & { communityId?: number }
) {
    const me = await getUserOrFail(currentUserId);
    ensureSuperAdmin(me.role?.name);
    return editHomestayCore(Number(homestayId), data);
}

/*
 * คำอธิบาย : ตรวจสิทธิ์ SuperAdmin แล้วดึงรายละเอียด Homestay ตาม id
 * Input  : currentUserId:number, homestayId:number
 * Output : homestay (รวมความสัมพันธ์) หรือ null
 */
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

/* *************************************** ทำไว้ชั่วคราวรอใช้ของเพื่อน กรณีเพื่อน pr มาแล้เ้ว ค่อยลบ
 * คำอธิบาย : ดึงรายละเอียด Homestay ตาม id (แบบไม่ตรวจ role — ใช้ภายในระบบ)
 * Input  : id:number
 * Output : homestay (รวมความสัมพันธ์) หรือ null
 */
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
            tagHomestays: {
                include: {
                    tag: { select: { id: true, name: true } },
                },
            },
        },
    });
}
