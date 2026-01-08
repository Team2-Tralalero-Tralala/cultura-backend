import type { UserPayload } from "~/Libs/Types/index.js";
import { mapLocation } from "../community/community-service.js";
import prisma from "../database-service.js";
import type { StoreDto } from "./store-dto.js";
import type { PaginationResponse } from "~/Libs/Types/pagination-dto.js";
/*
 * ฟังก์ชัน : createStore
 * คำอธิบาย :
 *   สร้างร้านค้าใหม่ในชุมชน โดยเชื่อมโยงกับ:
 *     - ชุมชน (communityId)
 *     - ที่ตั้ง (location)
 *     - รูปภาพร้านค้า (storeImage)
 *     - ประเภทร้านค้า (tagStores)
 * Input :
 *   - store : ข้อมูลร้านค้า (StoreDto)
 *   - user : ข้อมูลผู้ใช้ที่ร้องขอ (UserPayload)
 *   - communityId : รหัสชุมชนที่ร้านค้าสังกัด
 * Output :
 *   - ข้อมูลร้านค้าที่สร้างใหม่
 */
export async function createStore(store: StoreDto, communityId: number) {
  const { location, storeImage, tagStores, ...storeData } = store;

  return prisma.$transaction(async (transaction) => {
    const newStore = await transaction.store.create({
      data: {
        ...storeData,
        community: { connect: { id: communityId } },
        location: { create: mapLocation(location) },
        storeImage: {
          create:
            storeImage?.map((img) => ({
              image: img.image,
              type: img.type,
            })) ?? [],
        },
      },
      include: {
        storeImage: true,
        location: true,
      },
    });

    if (tagStores?.length) {
      await transaction.tagStore.createMany({
        data: tagStores.map((tagId: number) => ({
          tagId,
          storeId: newStore.id,
        })),
      });
    }

    return newStore;
  });
}

/* -------------------------------------------------------------------------- */
/*                              EDIT STORE                                    */
/* -------------------------------------------------------------------------- */
export async function editStore(
  storeId: number,
  store: StoreDto,
  user: UserPayload
) {
  const findStore = await prisma.store.findUnique({
    where: { id: storeId, isDeleted: false },
    include: { community: true },
  });

  if (!findStore) throw new Error("ไม่พบร้านค้า");
  if (
    user.role.toLowerCase() === "admin" &&
    findStore.community.adminId !== user.id
  ) {
    throw new Error("คุณไม่มีสิทธิ์แก้ไขร้านค้าของชุมชนอื่น");
  }

  const { location, tagStores, storeImage, ...storeData } = store;
  return prisma.$transaction(async (transaction) => {
    const newStore = await transaction.store.update({
      where: { id: storeId },
      data: {
        ...storeData,
        location: { update: mapLocation(location) },
        storeImage: {
          deleteMany: {},
          create: storeImage.map((img) => ({
            image: img.image,
            type: img.type,
          })),
        },
      },
      include: {
        storeImage: true,
        location: true,
      },
    });
    await transaction.tagStore.deleteMany({
      where: { storeId },
    });
    await transaction.tagStore.createMany({
      data: tagStores.map((tagId) => ({
        tagId,
        storeId,
      })),
    });
    return newStore;
  });
}
/**
 * ฟังก์ชัน : getStoreById
 * คำอธิบาย : ดึงข้อมูลร้านค้าตามรหัสร้านค้า
 * Input :
 *   - storeId : รหัสร้านค้า
 * Output :
 *   - ข้อมูลร้านค้าที่พบ
 */
export async function getStoreById(storeId: number, user: UserPayload) {
  const findStore = await prisma.store.findFirst({
    where: {
      id: storeId,
    },
    include: { community: true },
  });

  if (!findStore) throw new Error("ไม่พบร้านค้า");
  if (
    user.role.toLowerCase() === "admin" &&
    findStore.community.adminId !== user.id
  ) {
    throw new Error("คุณไม่มีสิทธิ์เข้าถึงร้านค้าของชุมชนอื่น");
  }
  return prisma.store.findFirst({
    where: {
      id: storeId,
      isDeleted: false,
      deleteAt: null,
    },
    select: {
      id: true,
      name: true,
      detail: true,
      storeImage: true,
      communityId: true,
      tagStores: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      location: true,
    },
  });
}

/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้าทั้งหมด สำหรับ super admin
 * Input :
 * - userId : number (รหัสผู้ใช้งาน ที่ต้องมี role เป็น admin และต้องสังกัดชุมชน)
 * - page : number (หน้าที่ต้องการแสดงผล เริ่มต้นที่ 1)
 * - limit : number (จำนวนรายการต่อหน้า เริ่มต้นที่ 10)
 *
 * Output :
 * - PaginationResponse : ประกอบด้วยข้อมูลร้านค้า (id, name, detail, tags)
 *   และ metadata สำหรับการแบ่งหน้า เช่น currentPage, totalPages, totalCount, limit
 */
export const getAllStore = async (
  userRole: string,
  communityId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> => {
  if (userRole != "superadmin") {
    throw new Error("ไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
  }
  const community = await prisma.community.findFirst({
    where: { id: communityId, isDeleted: false },
  });
  if (!community) throw new Error("ไม่พบชุมชน");

  const skip = (page - 1) * limit;

  const totalCount = await prisma.store.count({
    where: {
      isDeleted: false,
      communityId, 
    },
  });

  const stores = await prisma.store.findMany({
    where: {
      isDeleted: false,
      communityId,
    },
    orderBy: { id: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      detail: true,
      tagStores: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: stores,
    pagination: {
      currentPage: page,
      limit,
      totalCount,
      totalPages,
    },
  };
};

/*
 * ฟังก์ชัน : createStoreByAdmin
 * คำอธิบาย :
 *   สร้างร้านค้าใหม่ในชุมชน โดยให้ระบบค้นหา communityId
 *   จาก admin ที่กำลังล็อกอิน (user.id)
 *   แล้วสร้างร้านค้าเชื่อมกับชุมชนนั้นโดยอัตโนมัติ
 * Input :
 *   - store : ข้อมูลร้านค้า (StoreDto)
 *   - user : ข้อมูลผู้ใช้ที่ร้องขอ (UserPayload)
 * Output :
 *   - ข้อมูลร้านค้าที่สร้างใหม่
 */
export async function createStoreByAdmin(store: StoreDto, user: UserPayload) {
  const { location, storeImage, tagStores, ...storeData } = store;

  return prisma.$transaction(async (transaction) => {
    const community = await transaction.community.findFirst({
      where: {
        adminId: user.id,
        isDeleted: false,
        deleteAt: null,
      },
      select: { id: true },
    });

    if (!community) {
      throw new Error("ไม่พบชุมชนของผู้ดูแลรายนี้");
    }
    const newStore = await transaction.store.create({
      data: {
        ...storeData,
        community: { connect: { id: community.id } },
        location: { create: mapLocation(location) },
        storeImage: {
          create: storeImage.map((img) => ({
            image: img.image,
            type: img.type,
          })),
        },
      },
      include: {
        storeImage: true,
        location: true,
      },
    });

    if (tagStores?.length) {
      await transaction.tagStore.createMany({
        data: tagStores.map((tagId: number) => ({
          tagId,
          storeId: newStore.id,
        })),
      });
    }

    return newStore;
  });
}
/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้าทั้งหมดที่อยู่ในชุมชนของผู้ใช้ที่มี role เป็น "admin"
 *            โดยดึงข้อมูลจาก community ที่ user สังกัดอยู่
 *            ใช้สำหรับหน้ารวมร้านค้าในฝั่งผู้ดูแลชุมชน และรองรับการแบ่งหน้า (pagination)
 * Input :
 * - userId : number (รหัสผู้ใช้งาน ที่ต้องมี role เป็น admin และต้องสังกัดชุมชน)
 * - page : number (หน้าที่ต้องการแสดงผล เริ่มต้นที่ 1)
 * - limit : number (จำนวนรายการต่อหน้า เริ่มต้นที่ 10)
 *
 * Output :
 * - PaginationResponse : ประกอบด้วยข้อมูลร้านค้า (id, name, detail, tags)
 *   และ metadata สำหรับการแบ่งหน้า เช่น currentPage, totalPages, totalCount, limit
 */
export async function getAllStoreForAdmin(
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("รหัสผู้ใช้ต้องเป็นหมายเลข");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId, role: { name: "admin" } },
    include: {
      communityAdmin: true,
    },
  });

  if (!user) throw new Error("ไม่พบผู้ใช้");

  const communityId = user.communityAdmin[0]?.id;
  if (!communityId) {
    throw new Error("ผู้ใช้ไม่มีชุมชนที่สังกัด");
  }

  const skip = (page - 1) * limit;

  const totalCount = await prisma.store.count({
    where: {
      isDeleted: false,
      communityId,
    },
  });

  const stores = await prisma.store.findMany({
    where: {
      isDeleted: false,
      communityId,
    },
    orderBy: { id: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      detail: true,
      tagStores: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const totalPages = Math.ceil(totalCount / limit);
  return {
    data: stores,
    pagination: {
      currentPage: page,
      limit,
      totalCount,
      totalPages,
    },
  };
}

/*
 * ฟังก์ชัน : deleteStore
 * คำอธิบาย :
 *   ฟังก์ชันสำหรับลบร้านค้าแบบ Soft Delete (ตั้งค่า isDeleted = true)
 *   โดยตรวจสอบสิทธิ์ของผู้ใช้ก่อนดำเนินการ
 *   - superadmin : สามารถลบร้านค้าได้ทุกชุมชน
 *   - admin      : สามารถลบร้านค้าได้เฉพาะร้านในชุมชนของตนเองเท่านั้น
 *
 * Input :
 *   - storeId : หมายเลขรหัสร้านค้า (number)
 *   - user    : ข้อมูลผู้ใช้งาน (UserPayload) ที่ส่งมาจาก Middleware
 *
 * Output :
 *   - ข้อมูลร้านค้าที่ถูกลบ (แบบ soft delete)
 *   - Error : หากไม่พบร้านค้าหรือผู้ใช้ไม่มีสิทธิ์
 */
export async function deleteStore(storeId: number, user: UserPayload) {
  // 🔹 ตรวจสอบสิทธิ์ของผู้ใช้
  if (
    user.role.toLowerCase() !== "superadmin" &&
    user.role.toLowerCase() !== "admin"
  ) {
    throw new Error("คุณไม่มีสิทธิ์ลบร้านค้า");
  }

  // 🔹 ตรวจสอบว่ามีร้านค้านี้อยู่จริงหรือไม่
  const findStore = await prisma.store.findUnique({
    where: { id: storeId },
    include: { community: true },
  });

  if (!findStore) {
    throw new Error("ไม่พบร้านค้าที่ต้องการลบ");
  }

  // 🔹 ตรวจสอบสิทธิ์ของ admin ว่ามีสิทธิ์ในชุมชนนี้หรือไม่
  if (
    user.role.toLowerCase() === "admin" &&
    findStore.community.adminId !== user.id
  ) {
    throw new Error("คุณไม่มีสิทธิ์ลบร้านค้าของชุมชนอื่น");
  }

  // 🔹 ลบแบบ Soft Delete
  return prisma.store.update({
    where: { id: storeId },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });
}

/**
 * ฟังก์ชัน : deleteStoreByAdmin
 * อธิบาย : ลบร้านค้าแบบ soft delete เฉพาะร้านในชุมชนของ admin เท่านั้น
 * Input :
 *   - userId : รหัสผู้ใช้ (admin)
 *   - storeId : รหัสร้านค้า
 * Output :
 *   - ข้อมูลร้านที่ถูกลบ (หรือ error ถ้าไม่พบ)
 */
export async function deleteStoreByAdmin(userId: number, storeId: number) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isInteger(storeId) || storeId <= 0) {
    throw new Error("Invalid storeId");
  }

  // 🔹 ตรวจสอบสิทธิ์ของ user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      communityMembers: { select: { communityId: true }, take: 1 },
      communityAdmin: { select: { id: true }, take: 1 },
      role: {
        select: { name: true },
      },
    },
  });

  if (!user) throw new Error("User not found");
  if (user.role?.name?.toLowerCase() !== "admin") {
    throw new Error("Forbidden: Only admin can delete stores");
  }

  const communityId =
    user.communityMembers[0]?.communityId ?? user.communityAdmin[0]?.id;
  if (!communityId) {
    throw new Error("User is not assigned to any community");
  }

  // 🔹 ตรวจสอบว่าร้านอยู่ในชุมชนของ admin หรือไม่
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store || store.isDeleted) {
    throw new Error("Store not found or already deleted");
  }
  if (store.communityId !== communityId) {
    throw new Error(
      "Forbidden: You can only delete stores in your own community"
    );
  }

  // 🔹 ลบแบบ soft delete
  const deletedStore = await prisma.store.update({
    where: { id: storeId },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });

  return deletedStore;
}

/**
 * คำอธิบาย :
 *  - ดึงรายละเอียดร้านค้าที่เลือก (เต็ม)
 *  - ดึงร้านอื่นในชุมชนเดียวกัน (เฉพาะชื่อ + รูป) แบบ pagination
 *
 * Input :
 *  - communityId : number
 *  - storeId : number
 *  - page : number (default = 1)
 *  - limit : number (default = 12)
 *
 * Output :
 *  - store : รายละเอียดร้านค้าที่เลือก
 *  - otherStores : ร้านอื่นในชุมชน (pagination)
 */
export const getStoreWithOtherStoresInCommunity = async (communityId: number, storeId: number, page: number = 1, limit: number = 12) => {
  if (!Number.isInteger(communityId) || !Number.isInteger(storeId) || !Number.isInteger(page) || !Number.isInteger(limit)) {
    throw new Error("Invalid parameter");
  }

  if (page < 1 || limit < 1) {
    throw new Error("page และ limit ต้องมากกว่า 0");
  }

  const community = await prisma.community.findFirst({
    where: {
      id: communityId,
      isDeleted: false,
    },
  });

  if (!community) throw new Error("Community not found");

  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      communityId,
      isDeleted: false,
      deleteAt: null,
    },
    select: {
      id: true,
      name: true,
      detail: true,
      storeImage: true,
      communityId: true,
      location: true,
      tagStores: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!store) throw new Error("ไม่พบร้านค้า");

  const skip = (page - 1) * limit;

  const totalCount = await prisma.store.count({
    where: {
      communityId,
      isDeleted: false,
      id: { not: storeId },
    },
  });

  const otherStores = await prisma.store.findMany({
    where: {
      communityId,
      isDeleted: false,
      id: { not: storeId },
    },
    orderBy: { id: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      storeImage: true,
    },
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    store,
    otherStores: {
      data: otherStores,
      pagination: {
        currentPage: page,
        limit,
        totalCount,
        totalPages,
      },
    },
  };
};
