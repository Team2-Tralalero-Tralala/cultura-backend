import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ดึงทั้งหมดใน community
export const getHistoriesByCommunity = async (communityId: number) => {
  return prisma.bookingHistory.findMany({
    where: { package: { communityId } },
    include: { package: true },
  });
};

// ดึงทั้งหมดของ member 
export const getHistoriesByMember = async (memberId: number) => {
  return prisma.bookingHistory.findMany({
    where: { package: { overseerMemberId: memberId } },
    include: { package: true }, 
  });
};
