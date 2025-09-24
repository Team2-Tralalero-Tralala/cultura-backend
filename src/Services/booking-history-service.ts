import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//ดึง booking histories ทั้งหมดใน community
export const getHistoriesByCommunity = async (communityId: number) => {
  return prisma.bookingHistory.findMany({
    where: { package: { communityId } }, 
    include: {
      tourist: { select: { fname: true, lname: true } },
      package: { select: { name: true, price: true } },
    },
    orderBy: { bookingAt: "desc" },
  });
};

//ดึงbooking histories ทั้งหมดของ member

export const getHistoriesByMember = async (memberId: number) => {
  return prisma.bookingHistory.findMany({
    where: { package: { overseerMemberId: memberId } }, 
    include: {
      tourist: { select: { fname: true, lname: true } },
      package: { select: { name: true, price: true } },
    },
    orderBy: { bookingAt: "desc" },
  });
};
