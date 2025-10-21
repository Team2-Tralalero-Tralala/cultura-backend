import { Prisma, UserStatus } from "@prisma/client";
import prisma from "../database-service.js";
import type { PaginationResponse } from "~/Libs/Types/pagination-dto.js";
import type { UserPayload } from "~/Libs/Types/index.js";

/*
 * ฟังก์ชัน : getAccountAll
 * คำอธิบาย : ดึงข้อมูลผู้ใช้ทั้งหมดจากฐานข้อมูล
 * รองรับ:
 *   - SuperAdmin → เห็นทุกคน
 *   - Admin → เห็นเฉพาะสมาชิกในชุมชนตัวเอง
 *   - Member/Tourist → เห็นเฉพาะบัญชีตัวเอง
 * พร้อมรองรับ searchName และ filterRole
 */
export async function getAccountAll(
  user: UserPayload,
  page: number = 1,
  limit: number = 10,
  searchName?: string,
  filterRole?: string
): Promise<PaginationResponse<any>> {
  const skip = (page - 1) * limit;
  const whereCondition: any = {};

  // Role-based condition
  if (user.role.toLowerCase() === "superadmin") {
    // เห็นทุกคน
  } else if (user.role.toLowerCase() === "admin") {
    const adminCommunities = await prisma.community.findMany({
      where: { adminId: user.id },
      select: { id: true },
    });
    const communityIds = adminCommunities.map((c) => c.id);

    if (communityIds.length === 0) {
      whereCondition.id = user.id; // ไม่มีชุมชน → เห็นเฉพาะตัวเอง
    } else {
      whereCondition.memberOfCommunity = { in: communityIds };
    }
  } else {
    whereCondition.id = user.id; // member / tourist
  }

  // ดึงเฉพาะผู้ใช้ที่มีสถานะ ACTIVE เท่านั้น
  whereCondition.status = "ACTIVE";
  whereCondition.isDeleted = false;
  whereCondition.deleteAt = null;

  // Search ชื่อ
  if (searchName) {
    whereCondition.OR = [
      { fname: { contains: searchName } },
      { lname: { contains: searchName } },
      { username: { contains: searchName } },
    ];
  }

  // Filter Role
  if (filterRole && filterRole.toLowerCase() !== "all") {
    whereCondition.role = { name: filterRole };
  }

  const totalCount = await prisma.user.count({ where: whereCondition });

  const users = await prisma.user.findMany({
    where: whereCondition,
    select: {
      id: true,
      fname: true,
      lname: true,
      username: true,
      email: true,
      status: true,
      role: { select: { name: true } },
      memberOf: { select: { name: true } },
    },
    orderBy: { id: "desc" },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: users,
    pagination: { currentPage: page, totalPages, totalCount, limit },
  };
}

/*
 * ฟังก์ชัน : getUserByStatus
 * คำอธิบาย : ดึงข้อมูลผู้ใช้ตามสถานะ พร้อมการค้นหา และกรองตาม role ของผู้ใช้ที่ล็อกอิน
 */
export async function getUserByStatus(
  user: UserPayload,
  status: UserStatus,
  page: number = 1,
  limit: number = 10,
  searchName?: string
): Promise<PaginationResponse<any>> {
  const skip = (page - 1) * limit;
  const whereCondition: any = {};

  // Role-based visibility
  if (user.role.toLowerCase() === "superadmin") {
    // เห็นทุกคน
  } else if (user.role.toLowerCase() === "admin") {
    const adminCommunities = await prisma.community.findMany({
      where: { adminId: user.id },
      select: { id: true },
    });
    const communityIds = adminCommunities.map((c) => c.id);

    if (communityIds.length === 0) {
      whereCondition.id = user.id;
    } else {
      whereCondition.memberOfCommunity = { in: communityIds };
    }
  } else {
    whereCondition.id = user.id;
  }

  // ดึงเฉพาะผู้ใช้ที่มีสถานะ BLOCKED เท่านั้น
  whereCondition.status = "BLOCKED";
  whereCondition.isDeleted = false;
  whereCondition.deleteAt = null;
  
  // 🔍 Search ชื่อ
  if (searchName) {
    whereCondition.OR = [
      { fname: { contains: searchName } },
      { lname: { contains: searchName } },
      { username: { contains: searchName } },
    ];
  }

  const totalCount = await prisma.user.count({ where: whereCondition });

  const users = await prisma.user.findMany({
    where: whereCondition,
    select: {
      id: true,
      username: true,
      fname: true,
      lname: true,
      email: true,
      activityRole: true,
      role: { select: { name: true } },
      memberOf: { select: { name: true } },
    },
    orderBy: { id: "desc" },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: users,
    pagination: { currentPage: page, totalPages, totalCount, limit },
  };
}

/*
 * ฟังก์ชัน : getUserById / block / unblock / delete
 * คงเหมือนเดิม
 */

export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profileImage: true,
      username: true,
      email: true,
      fname: true,
      lname: true,
      phone: true,
      activityRole: true,
      role: { select: { name: true } },
      memberOf: { select: { name: true } },
    },
  });
  if (!user) throw new Error("User not found");
  return user;
}

export async function deleteAccount(userId: number) {
  const findUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!findUser) throw new Error("User not found");

  const deleteUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });
  return deleteUser;
}

export async function blockAccount(userId: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.BLOCKED },
    select: { username: true, status: true },
  });
  if (!user) throw new Error("User not found");
  return user;
}

export async function unblockAccount(userId: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.ACTIVE },
    select: { username: true, status: true },
  });
  if (!user) throw new Error("User not found");
  return user;
}
