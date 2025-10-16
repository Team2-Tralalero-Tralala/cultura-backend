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
  const { location, tagStores, storeImage, ...storeData } = store;

  return prisma.$transaction(async (transaction) => {
    if (user.role.toLowerCase() === "admin") {
      const adminCommunity = await transaction.community.findFirst({
        where: { adminId: user.id },
        select: { id: true },
      });
      if (!adminCommunity) {
        throw new Error("ไม่พบชุมชนที่คุณดูแลอยู่");
      }

      if (adminCommunity.id !== communityId) {
        throw new Error("คุณไม่สามารถสร้างร้านค้าในชุมชนอื่นได้");
      }
    }
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
    });
    await transaction.tagStore.createMany({
      data: tagStores.map((tagId) => ({
        tagId,
        storeId: newStore.id,
      })),
    });
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
