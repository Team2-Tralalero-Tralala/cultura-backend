import prisma from "../database-service.js";
import type { HomestayDto, HomestayImageDto } from "./homestay-dto.js";
import type { PaginationResponse } from "../pagination-dto.js";
/*
 * คำอธิบาย : ดึงผู้ใช้ตาม userId; ไม่พบให้ throw
 * Input  : userId:number
 * Output : user (พร้อม role) หรือ throw Error
 */
async function getUserOrFail(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
            id: true,
            role: true, // ยังคง include role เหมือนเดิม
            communityId: true, // <-- เพิ่มบรรทัดนี้
        },
    });
    if (!user) throw new Error(`User ID ${userId} ไม่พบในระบบ`);
    return user;
}

const stripUploadPrefix = (s?: string) =>
    (s || "").replace(/\\/g, "/").replace(/^(\.\/)?(public\/)?(uploads\/)+/i, "");

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
                            image: stripUploadPrefix(f.image),
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
                        image: stripUploadPrefix(f.image),
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
    // --- ตรวจผู้ใช้และสิทธิ์ ---
    const me = await getUserOrFail(currentUserId);
    ensureSuperAdmin(me.role?.name);

    // --- ตรวจว่ามี community เป้าหมายจริง ---
    await getCommunityOrFail(Number(communityId));

    // --- เตรียม operations สำหรับทรานแซคชันแบบ array (จะไม่มีตัวแปร tx ให้ implicit any) ---
    const ops = dataList.map((d) => {
        const tagIds = normalizeTagIdArray((d as any).tagHomestays);

        return prisma.homestay.create({
            data: {
                // เปลี่ยนจาก communityId: Number(communityId)
                // เป็นการเชื่อมความสัมพันธ์แบบ connect แทน
                community: { connect: { id: Number(communityId) } },

                name: d.name,
                type: d.type,
                guestPerRoom: d.guestPerRoom,
                totalRoom: d.totalRoom,
                facility: d.facility,

                // ----- สร้าง location แบบ nested (ไม่ต้อง create แยกก่อน) -----
                location: {
                    create: {
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
                },

                // ----- แนบรูป homestay แบบ nested (ถ้ามี) -----
                ...(Array.isArray(d.homestayImage) && d.homestayImage.length > 0
                    ? {
                        homestayImage: {
                            create: d.homestayImage.map((f: HomestayImageDto) => ({
                                image: f.image,
                                type: f.type,
                            })),
                        },
                    }
                    : {}),

                // ----- แนบแท็ก homestay แบบ nested (ถ้ามี) -----
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
    });

    // --- รันทรานแซคชันแบบ array form (atomic ทั้งชุด) ---
    const results = await prisma.$transaction(ops);
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
// services/homestay-service.ts


/**
 * ฟังก์ชัน : getHomestaysAll
 * อธิบาย : ดึง homestay ทั้งหมดในชุมชน (สำหรับ SuperAdmin)
 * Mapping : GET /super/community/:communityId/homestays
 */
export const getHomestaysAll = async (
  userId: number,
  communityId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(userId) || !Number.isInteger(communityId)) {
    throw new Error("ID must be a number");
  }

  // ===== ตรวจสอบสิทธิ์ผู้ใช้ =====
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");

  const role = user.role?.name?.toLowerCase();
  if (role !== "superadmin") {
    throw new Error("Forbidden: Only SuperAdmin can access this route");
  }

  // ===== ตรวจสอบว่าชุมชนมีอยู่จริง =====
  const community = await prisma.community.findFirst({
    where: { id: communityId, isDeleted: false },
  });
  if (!community) throw new Error("Community not found");

  // ===== Pagination =====
  const skip = (page - 1) * limit;

  // ===== ดึงข้อมูล homestay =====
  const totalCount = await prisma.homestay.count({
    where: { communityId, isDeleted: false },
  });

  const homestays = await prisma.homestay.findMany({
    where: { communityId, isDeleted: false },
    orderBy: { id: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      type: true,
      facility: true,
    },
  });

  return {
    data: homestays,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
    },
  };
};

/**
 * ฟังก์ชัน : getHomestaysAllAdmin
 * อธิบาย : ดึง homestay ทั้งหมดของชุมชนที่ admin คนนั้นดูแล
 * Mapping : GET /admin/community/homestays/all
 */
export const getHomestaysAllAdmin = async (
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(userId)) {
    throw new Error("User ID must be a number");
  }

  // ===== ตรวจสอบสิทธิ์ผู้ใช้ =====
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");

  const role = user.role?.name?.toLowerCase();
  if (role !== "admin") {
    throw new Error("Forbidden: Only Admin can access this route");
  }

  // ===== หา community ที่ admin ดูแล =====
  const community = await prisma.community.findFirst({
    where: { adminId: userId, isDeleted: false },
  });
  if (!community) throw new Error("Admin has no assigned community");

  const communityId = community.id;

  // ===== Pagination =====
  const skip = (page - 1) * limit;

  // ===== ดึงข้อมูล homestay =====
  const totalCount = await prisma.homestay.count({
    where: { communityId, isDeleted: false },
  });

  const homestays = await prisma.homestay.findMany({
    where: { communityId, isDeleted: false },
    orderBy: { id: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      type: true,
      facility: true,
    },
  });

  return {
    data: homestays,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
    },
  };
};
/*
 * (Helper ใหม่)
 * คำอธิบาย : ตรวจสิทธิ์ว่าผู้ใช้เป็น Admin และดึง communityId ที่ผูกกับ Admin
 * Input  : user (ที่ include role และ communityId)
 * Output : communityId (number) หรือ throw Error
 */
function getAdminCommunityId(
    user: { role?: { name?: string | null } | null; communityId?: number | null },
): number {
    const role = user.role?.name?.toLowerCase();

    // 1. ต้องเป็น role "admin" เท่านั้น
    // (*** หมายเหตุ: หาก role ของคุณชื่อ 'member' หรืออื่น ๆ ให้แก้ตรงนี้)
    if (role !== "admin") {
        throw new Error("คุณไม่มีสิทธิ์ดำเนินการ (ต้องเป็น Admin ประจำชุมชนเท่านั้น)");
    }

    // 2. Admin ต้องผูกกับ communityId
    const communityId = user.communityId;
    
    if (!communityId) {
        throw new Error("บัญชี Admin ของคุณไม่ได้ผูกกับชุมชนใด");
    }

    // 3. คืนค่า communityId ของ Admin
    return communityId;
}

/*
 * (ปรับปรุง)
 * คำอธิบาย : ตรวจสิทธิ์ Admin และ "สร้าง" Homestay ในชุมชนของตนเอง
 * Input  : userId (ID ของ Admin), data (ข้อมูลที่พัก)
 * Output : homestay ที่ถูกสร้าง
 */
export async function createHomestayByAdmin(
    userId: number,
    data: HomestayDto,
) {
    const me = await getUserOrFail(userId);
    
    // 1. ตรวจสิทธิ์และดึง communityId จากตัว Admin เอง
    // (ฟังก์ชันนี้จะ throw error ถ้าไม่ใช่ Admin หรือไม่มี communityId)
    const adminCommunityId = getAdminCommunityId(me);
    
    // 2. ใช้ Core logic เดิม โดยบังคับใช้ communityId ของ Admin
    return createHomestayCore(adminCommunityId, data);
}

/*
 * (ฟังก์ชันใหม่ที่ต้องเพิ่ม)
 * คำอธิบาย : ตรวจสิทธิ์ Admin และดึงรายละเอียด Homestay ตาม id (สำหรับหน้า Edit)
 * Input  : userId (ID ของ Admin), homestayId (ID ที่พักที่จะดึง)
 * Output : homestay (รวมความสัมพันธ์) หรือ null/throw
 */
export async function getHomestayDetailByIdByAdmin(userId: number, homestayId: number) {
    const me = await getUserOrFail(userId);

    // 1. ตรวจสิทธิ์และดึง communityId จากตัว Admin เอง
    const adminCommunityId = getAdminCommunityId(me); // (ใช้ฟังก์ชันเดิมที่คุณมีอยู่)

    // 2. ดึงข้อมูลที่พัก
    const homestay = await prisma.homestay.findUnique({
        where: { id: Number(homestayId) },
        // 3. ใช้ include/select แบบเดียวกับ SuperAdmin เพื่อให้ Frontend (EditHomestayPageAdmin) ทำงานได้
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

    // 4. ตรวจสอบว่าพบที่พัก
    if (!homestay) {
        throw new Error(`Homestay ID ${homestayId} ไม่พบในระบบ`);
    }
    
    // 5. ตรวจสอบความเป็นเจ้าของ
    if (homestay.communityId !== adminCommunityId) {
        throw new Error("คุณไม่มีสิทธิ์เข้าถึงที่พักนี้ (ที่พักไม่ได้อยู่ในชุมชนของคุณ)");
    }

    // 6. คืนค่าข้อมูล
    return homestay;
}

/*
 * (ปรับปรุง)
 * คำอธิบาย : ตรวจสิทธิ์ Admin และ "แก้ไข" Homestay ที่อยู่ในชุมชนของตนเอง
 * Input  : userId (ID ของ Admin), homestayId (ID ที่พักที่จะแก้), data (ข้อมูลใหม่)
 * Output : homestay ที่อัปเดตแล้ว
 */
export async function editHomestayByAdmin(
    userId: number,
    homestayId: number,
    data: Partial<HomestayDto> & { communityId?: number },
) {
    const me = await getUserOrFail(userId);

    // 1. ตรวจสิทธิ์และดึง communityId จากตัว Admin เอง
    const adminCommunityId = getAdminCommunityId(me);

    // 2. ดึงข้อมูลที่พักที่จะแก้ไข
    const homestay = await getHomestayOrFail(Number(homestayId));

    // 3. ตรวจสอบความเป็นเจ้าของ: ที่พักนี้ต้องอยู่ในชุมชนของ Admin เท่านั้น
    if (homestay.communityId !== adminCommunityId) {
        throw new Error("คุณไม่มีสิทธิ์แก้ไขที่พักนี้ (ที่พักไม่ได้อยู่ในชุมชนของคุณ)");
    }

    // 4. (สำคัญ) ป้องกัน Admin ย้ายชุมชน
    // ถ้าใน data มีการส่ง communityId มา, มันจะต้องตรงกับ ID ชุมชนของ Admin เท่านั้น
    const newCommunityId = data.communityId ? Number(data.communityId) : null;
    if (newCommunityId && newCommunityId !== adminCommunityId) {
        throw new Error("Admin ไม่มีสิทธิ์ย้ายที่พักไปยังชุมชนอื่น");
    }

    // 5. ใช้ Core logic เดิม
    // (เราส่ง data ไปตามเดิม เพราะเรารู้แล้วว่า communityId ที่ส่งไป (ถ้ามี) ปลอดภัย)
    return editHomestayCore(Number(homestayId), data);
}
