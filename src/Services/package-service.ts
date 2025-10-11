import prisma from "../Services/database-service.js";

// ดึงข้อมูล package ตาม ID
export const getPackageById = async (id: number) => {
  return await prisma.package.findUnique({
    where: { id: id },
  });
};

// ดึงร้านค้า ตามเงื่อนไข (super/admin/tourist)
export const getStoresByRole = async (role: string, userCommunityId: number | null, packageCommunityId: number) => {
  if (role === 'superadmin') {
    return await prisma.store.findMany();
  }

  if (role === 'admin' && userCommunityId) {
    return await prisma.store.findMany({
      where: { communityId: userCommunityId },
    });
  }

  if (role === 'tourist') {
    return await prisma.store.findMany({
      where: { communityId: packageCommunityId },
    });
  }

  return [];
};

// ดึงที่พัก ตามเงื่อนไข (super/admin/tourist)
export const getHomestaysByRole = async (role: string, userCommunityId: number | null, packageCommunityId: number) => {
  if (role === 'superadmin') {
    return await prisma.homestay.findMany();
  }

  if (role === 'admin' && userCommunityId) {
    return await prisma.homestay.findMany({
      where: { id : userCommunityId },
    });
  }

  if (role === 'tourist') {
    return await prisma.homestay.findMany({
      where: { id: packageCommunityId },
    });
  }

  return [];
};
