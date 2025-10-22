import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";

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

    const totalCount = await prisma.store.count({
        where: {
            isDeleted: false,
            communityId, // ดึงเฉพาะร้านในชุมชนนั้น
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
                select:{
                    tag: {
                        select: {
                            id:true,
                            name:true
                        }
                    }
                }
            },
        },
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
