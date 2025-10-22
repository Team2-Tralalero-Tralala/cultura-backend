
import type { PaginationResponse } from "../pagination-dto.js";
import type { UserPayload } from "~/Libs/Types/index.js";
import type { StoreDto } from "./store-dto.js";
import prisma from "../database-service.js";

/**
 * ฟังก์ชัน : createStore
 * รายละเอียด : เพิ่มร้านค้าใหม่ในชุมชน พร้อม location, รูปภาพ, และ tag
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
        location: location ? { create: location } : undefined,
        storeImage: {
          create: storeImage?.map((img) => ({
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

    // เพิ่ม tag ของร้าน
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
 * ฟังก์ชัน : getAllStore
 * รายละเอียด : ดึงร้านค้าทั้งหมดในชุมชน (เฉพาะ superadmin)
 */
export const getAllStore = async (
  userId: number,
  communityId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(userId) || !Number.isInteger(communityId)) {
    throw new Error("ID must be a number");
  }

  // ตรวจสอบสิทธิ์ผู้ใช้
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role?.name?.toLowerCase() !== "superadmin") {
    throw new Error("Forbidden");
  }

  // ตรวจสอบว่าชุมชนมีอยู่จริง
  const community = await prisma.community.findFirst({
    where: { id: communityId, isDeleted: false },
  });
  if (!community) throw new Error("Community not found");

  const skip = (page - 1) * limit;

  const totalCount = await prisma.store.count({
    where: { isDeleted: false, communityId },
  });

  const stores = await prisma.store.findMany({
    where: { isDeleted: false, communityId },
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
            select: { id: true, name: true },
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
      totalPages,
      totalCount,
      limit,
    },
  };
};

/**
 * ฟังก์ชัน : getStoreById
 * รายละเอียด : ดึงข้อมูลร้านค้าตามรหัส
 */
export async function getStoreById(storeId: number) {
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
      tagStores: {
        select: {
          tag: { select: { id: true, name: true } },
        },
      },
      location: true,
    },
  });
}

/**
 * ฟังก์ชัน : editStore
 * รายละเอียด : แก้ไขข้อมูลร้านค้า (พร้อมอัปเดตแท็ก, รูปภาพ, location)
 */
export async function editStore(
  storeId: number,
  store: StoreDto,
  user: UserPayload
) {
  const { location, storeImage, tagStores, ...storeData } = store;

  // ตรวจสอบสิทธิ์
  const role = user.role.toLowerCase();
  if (role !== "superadmin" && role !== "admin") {
    throw new Error("คุณไม่มีสิทธิ์แก้ไขร้านค้า");
  }

  const exist = await prisma.store.findUnique({
    where: { id: storeId },
    include: { community: true },
  });
  if (!exist) throw new Error("ไม่พบร้านค้าที่ต้องการแก้ไข");

  if (role === "admin" && exist.community.adminId !== user.id) {
    throw new Error("คุณไม่มีสิทธิ์แก้ไขร้านค้าของชุมชนอื่น");
  }

  return prisma.$transaction(async (transaction) => {
    // อัปเดตข้อมูลหลักของร้าน
    const updatedStore = await transaction.store.update({
      where: { id: storeId },
      data: {
        ...storeData,
        location: location ? { update: location } : undefined,
      },
    });

    // ลบแท็กเดิมแล้วเพิ่มแท็กใหม่
    await transaction.tagStore.deleteMany({ where: { storeId } });
    if (tagStores?.length) {
      await transaction.tagStore.createMany({
        data: tagStores.map((tagId) => ({ tagId, storeId })),
      });
    }

    // ลบรูปเก่าแล้วเพิ่มรูปใหม่
    await transaction.storeImage.deleteMany({ where: { storeId } });
    if (storeImage?.length) {
      await transaction.storeImage.createMany({
        data: storeImage.map((img) => ({
          storeId,
          image: img.image,
          type: img.type,
        })),
      });
    }

    return updatedStore;
  });
}

/**
 * ฟังก์ชัน : deleteStore
 * รายละเอียด : Soft Delete ร้านค้า (isDeleted = true, deleteAt = เวลาปัจจุบัน)
 */
export async function deleteStore(storeId: number, user: UserPayload) {
  // ตรวจสอบสิทธิ์
  const role = user.role.toLowerCase();
  if (role !== "superadmin" && role !== "admin") {
    throw new Error("คุณไม่มีสิทธิ์ลบร้านค้า");
  }

  // ตรวจสอบว่าร้านค้ามีอยู่จริง
  const findStore = await prisma.store.findUnique({
    where: { id: storeId },
    include: { community: true },
  });

  if (!findStore) {
    throw new Error("ไม่พบร้านค้าที่ต้องการลบ");
  }

  // ถ้าเป็น admin ต้องเป็นเจ้าของชุมชนเท่านั้น
  if (role === "admin" && findStore.community.adminId !== user.id) {
    throw new Error("คุณไม่มีสิทธิ์ลบร้านค้าของชุมชนอื่น");
  }

  // Soft Delete
  const deleted = await prisma.store.update({
    where: { id: storeId },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });

  return deleted;
}
