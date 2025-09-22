import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ดึงทั้งหมดใน community
export const getHistoriesByCommunity = async (communityId: number) => {
  return prisma.bookingHistory.findMany({
    where: { package: { communityId } }, // ถ้า schema ใช้ snake_case ให้เปลี่ยนเป็น pk_community_id
    include: { package: true },
  });
};

// ดึงทั้งหมดของ member 
export const getHistoriesByMember = async (memberId: number) => {
  return prisma.bookingHistory.findMany({
    where: { package: { overseerMemberId: memberId } }, // ถ้าใช้ snake_case: pk_overseer_member_id
    include: { package: true }, 
  });
};
