import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";

/*
 * ฟังก์ชัน : getHomestaysAll
 * อธิบาย : ดึง homestay ทั้งหมดในชุมชน (ใช้ได้เฉพาะ superadmin เท่านั้น)
 * Input : userId (รหัสผู้ใช้), communityId (รหัสชุมชน), page, limit
 * Output :
 *   - ถ้าเป็น superadmin → ได้ homestay ทั้งหมดในชุมชนนั้นพร้อม pagination
 *   - ถ้าไม่ใช่ superadmin → ได้ []
 */
export const getHomestaysAll = async (
  userId: number,
  communityId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(userId) || !Number.isInteger(communityId))
    throw new Error("ID must be Number");

  // ตรวจสอบสิทธิ์ผู้ใช้
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role?.name !== "superadmin") {
    return {
      data: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalCount: 0,
        limit,
      },
    };
  }

  // ตรวจสอบว่าชุมชนมีอยู่จริง
  const community = await prisma.community.findUnique({
    where: { id: communityId, isDeleted: false },
  });
  if (!community) throw new Error("Community not found.");

  const skip = (page - 1) * limit;

  const totalCount = await prisma.homestay.count({
    where: { communityId, isDeleted: false },
  });

const homestays = await prisma.homestay.findMany({
  where: { communityId, isDeleted: false },
  orderBy: { id: "asc" },
  skip,
  take: limit,
  select: {
    name: true,        // ชื่อที่พัก
    facility: true,    // สิ่งอำนวยความสะดวก
    type: true,        // ประเภทห้องพัก
  },
});


  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: homestays,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
    },
  };
};
