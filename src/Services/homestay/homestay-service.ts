// services/homestay-service.ts
import prisma from "../database-service.js";
import { HomestayDto } from "./homestay-dto.js";
import type { PaginationResponse } from "../pagination-dto.js";

/*
 * ฟังก์ชัน : getHomestaysAll
 * อธิบาย : ดึง homestay ทั้งหมดในชุมชน (ใช้ได้เฉพาะ superadmin เท่านั้น)
 * Input : userId (รหัสผู้ใช้), communityId (รหัสชุมชน), page, limit
 * Output :
 *   - ถ้าเป็น superadmin → ได้ homestay ทั้งหมดในชุมชนนั้นพร้อม pagination
 *   - ถ้าไม่ใช่ superadmin → Forbidden
 */
export const getHomestaysAll = async (
  userId: number,
  communityId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(userId) || !Number.isInteger(communityId)) {
    throw new Error("ID must be Number");
  }

  //ตรวจสอบสิทธิ์ผู้ใช้
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role?.name?.toLowerCase() !== "superadmin") {
    throw new Error("Forbidden");
  }

  // ตรวจสอบว่าชุมชนมีอยู่จริง (ใช้ findFirst ป้องกัน soft-delete)
  const community = await prisma.community.findFirst({
    where: { id: communityId, isDeleted: false },
  });
  if (!community) throw new Error("Community not found");

  const skip = (page - 1) * limit;

  // นับจำนวน homestay ทั้งหมดในชุมชน
  const totalCount = await prisma.homestay.count({
    where: { communityId, isDeleted: false },
  });

  // ดึงข้อมูล homestay เฉพาะ field ที่ต้องการ
  const homestays = await prisma.homestay.findMany({
    where: { communityId, isDeleted: false },
    orderBy: { id: "asc" },
    skip,
    take: limit,
    select: {
      id: true,        // รหัสที่พัก
      name: true,      // ชื่อที่พัก
      type: true,      // ประเภทห้องพัก
      facility: true,  // สิ่งอำนวยความสะดวก
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
