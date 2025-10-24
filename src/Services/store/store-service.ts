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
export async function createStore(
  store: StoreDto,
  user: UserPayload,
  communityId: number
) {
  const { location, storeImage, tagStores, ...storeData } = store;

  return prisma.$transaction(async (transaction) => {
    const newStore = await transaction.store.create({
      data: {
        ...storeData,
        community: { connect: { id: communityId } },
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

/*
 * ฟังก์ชัน : editStore
 * รายละเอียด :
 *   แก้ไขข้อมูลร้านค้าตามรหัส โดยอัปเดตข้อมูลทั่วไป ที่ตั้ง รูปภาพ และป้ายกำกับ
 * Input :
 *   - storeId : รหัสร้านค้า
 *   - store : ข้อมูลร้านค้าที่แก้ไข (StoreDto)
 *   - user : ข้อมูลผู้ใช้ที่ร้องขอ (UserPayload)
 * Output :
 *   - ข้อมูลร้านค้าที่อัปเดตแล้ว
 */
export async function editStore(
  storeId: number,
  store: StoreDto,
  user: UserPayload
) {
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
        tagStores: true,
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
export async function getStoreById(storeId: number) {
  return prisma.store.findFirst({
    where: {
      id: storeId,
      isDeleted: false,
      deleteAt: null,
    },
    select: {
      name: true,
      detail: true,
      storeImage: true,
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
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้าทั้งหมดที่อยู่ในชุมชนตาม communityId
 *            ใช้สำหรับหน้ารวมร้านค้าในแต่ละชุมชน และรองรับการแบ่งหน้า (pagination)
 * Input :
 * - communityId : number (รหัสชุมชนที่ต้องการดึงร้านค้า)
 * - page : number (หน้าที่ต้องการแสดงผล เริ่มต้นที่ 1)
 * - limit : number (จำนวนรายการต่อหน้า เริ่มต้นที่ 10)
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
  if (!Number.isInteger(communityId)) {
    throw new Error("ID must be a number");
  }
  if (userRole != "superadmin") {
    throw new Error("Forbidden");
  }
  const community = await prisma.community.findFirst({
    where: { id: communityId, isDeleted: false },
  });
  if (!community) throw new Error("Community not found");

  const skip = (page - 1) * limit;

  const totalCount = await prisma.store.count({
    where: {
      isDeleted: false,
      communityId, // ดึงเฉพาะร้านในชุมชนนั้น
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

/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้าทั้งหมดที่อยู่ในชุมชนของผู้ใช้ที่มี role เป็น "admin"
 *            โดยดึงข้อมูลจาก community ที่ user สังกัดอยู่ (ผ่าน memberOfCommunity)
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
    throw new Error("User ID must be a number");
  }

  // ดึงข้อมูล user พร้อม role และชุมชนที่สังกัด
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      Community: true,
    },
  });

  if (!user) throw new Error("User not found");

  if (user.role?.name?.toLowerCase() !== "admin") {
    throw new Error("Forbidden: only admin can access this resource");
  }

  // ใช้ communityId จาก user โดยตรง
  const communityId = user.communityId;
  if (!communityId) {
    throw new Error("User is not assigned to any community");
  }

  const skip = (page - 1) * limit;

  // ดึงจำนวนร้านค้าในชุมชนนั้น
  const totalCount = await prisma.store.count({
    where: {
      isDeleted: false,
      communityId,
    },
  });

  // ดึงข้อมูลร้านค้า
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
