import type { UserPayload } from "~/Libs/Types/index.js";
import { mapLocation } from "../community/community-service.js";
import prisma from "../database-service.js";
import type { StoreDto } from "./store-dto.js";
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


/*
 * ฟังก์ชัน : deleteStore
 * รายละเอียด :
 *   ทำการ Soft Delete ร้านค้า (ไม่ลบจริง) โดยตั้งค่า isDeleted = true และเก็บเวลาที่ลบใน deleteAt
 * Input :
 *   - storeId : รหัสร้านค้า
 *   - user : ข้อมูลผู้ใช้ (ใช้ตรวจสอบสิทธิ์)
 * Output :
 *   - ร้านค้าที่ถูกลบ
 */
export async function deleteStore(storeId: number, user: UserPayload) {
  //ตรวจสอบสิทธิ์
  if (user.role.toLowerCase() !== "superadmin" && user.role.toLowerCase() !== "admin") {
    throw new Error("คุณไม่มีสิทธิ์ลบร้านค้า");
  }

  //ตรวจสอบว่าร้านค้านี้มีอยู่หรือไม่
  const findStore = await prisma.store.findUnique({
    where: { id: storeId },
    include: { community: true },
  });

  if (!findStore) {
    throw new Error("ไม่พบร้านค้าที่ต้องการลบ");
  }

  //ถ้าเป็น admin ต้องเป็นเจ้าของชุมชนนั้นเท่านั้นถึงจะลบได้
  if (
    user.role.toLowerCase() === "admin" &&
    findStore.community.adminId !== user.id
  ) {
    throw new Error("คุณไม่มีสิทธิ์ลบร้านค้าของชุมชนอื่น");
  }

  //Soft delete โดยตั้ง isDeleted = true และบันทึกเวลา deleteAt
  const deleted = await prisma.store.update({
    where: { id: storeId },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });

  return deleted;
}
