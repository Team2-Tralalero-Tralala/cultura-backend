import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";
import type { StoreDto } from "./store-dto.js";
import type { UserPayload } from "~/Libs/Types/index.js";
import { mapLocation } from "../community/community-service.js";

/* -------------------------------------------------------------------------- */
/*                              CREATE STORE                                  */
/* -------------------------------------------------------------------------- */
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
          create: storeImage?.map((img) => ({
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

  if (!findStore) throw new Error("ไม่พบร้านค้าที่ต้องการแก้ไข");

  if (
    user.role.toLowerCase() === "admin" &&
    findStore.community.adminId !== user.id
  ) {
    throw new Error("คุณไม่มีสิทธิ์แก้ไขร้านค้าของชุมชนอื่น");
  }

  const { location, storeImage, tagStores, ...storeData } = store;

  return prisma.$transaction(async (transaction) => {
    const updatedStore = await transaction.store.update({
      where: { id: storeId },
      data: {
        ...storeData,
        location: { update: mapLocation(location) },
        storeImage: {
          deleteMany: {},
          create: storeImage?.map((img) => ({
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

    // อัปเดต tagStores
    await transaction.tagStore.deleteMany({ where: { storeId } });
    if (tagStores?.length) {
      await transaction.tagStore.createMany({
        data: tagStores.map((tagId) => ({ tagId, storeId })),
      });
    }

    return updatedStore;
  });
}

/* -------------------------------------------------------------------------- */
/*                              GET ALL STORES                                */
/* -------------------------------------------------------------------------- */
export async function getAllStore(
  userId: number,
  communityId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> {
  if (!Number.isInteger(userId) || !Number.isInteger(communityId)) {
    throw new Error("ID must be a number");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) throw new Error("User not found");
  if (user.role?.name?.toLowerCase() !== "superadmin") {
    throw new Error("Forbidden");
  }

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
          tag: { select: { id: true, name: true } },
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
}

/* -------------------------------------------------------------------------- */
/*                              GET STORE BY ID                               */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                              DELETE STORE                                  */
/* -------------------------------------------------------------------------- */
export async function deleteStore(storeId: number, user: UserPayload) {
  if (
    user.role.toLowerCase() !== "superadmin" &&
    user.role.toLowerCase() !== "admin"
  ) {
    throw new Error("คุณไม่มีสิทธิ์ลบร้านค้า");
  }

  const findStore = await prisma.store.findUnique({
    where: { id: storeId },
    include: { community: true },
  });

  if (!findStore) {
    throw new Error("ไม่พบร้านค้าที่ต้องการลบ");
  }

  if (
    user.role.toLowerCase() === "admin" &&
    findStore.community.adminId !== user.id
  ) {
    throw new Error("คุณไม่มีสิทธิ์ลบร้านค้าของชุมชนอื่น");
  }

  return prisma.store.update({
    where: { id: storeId },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });
}
