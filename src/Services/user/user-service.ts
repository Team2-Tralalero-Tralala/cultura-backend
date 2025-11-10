import { Prisma, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../database-service.js";
import type { PaginationResponse } from "~/Libs/Types/pagination-dto.js";
import type { UserPayload } from "~/Libs/Types/index.js";
import type { PasswordDto } from "~/Services/user/password-dto.js";
import type { ChangePasswordDto } from "~/Controllers/user-controller.js";

/**
 * ฟังก์ชัน: getAccountAll
 * วัตถุประสงค์: ดึงข้อมูลผู้ใช้ทั้งหมดจากฐานข้อมูล
 * รองรับ:
 *   - SuperAdmin → เห็นทุกคน
 *   - Admin → เห็นเฉพาะสมาชิกในชุมชนตัวเอง
 *   - Member/Tourist → เห็นเฉพาะบัญชีตัวเอง
 */
export async function getAccountAll(
  user: UserPayload,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> {
  const skip = (page - 1) * limit;
  const whereCondition: any = {};

  // Role-based condition
  if (user.role.toLowerCase() === "superadmin") {
    whereCondition.id = { not: user.id };
  } else if (user.role.toLowerCase() === "admin") {
    const adminCommunities = await prisma.community.findMany({
      where: { adminId: user.id },
      select: { id: true },
    });

    const communityIds = adminCommunities.map((community) => community.id);

    if (communityIds.length === 0) {
      whereCondition.id = { not: user.id };
    } else {
      whereCondition.memberOfCommunity = { in: communityIds };
      whereCondition.id = { not: user.id };
    }
  } else {
    whereCondition.id = user.id; // Member / Tourist เห็นเฉพาะบัญชีตัวเอง
  }

  whereCondition.status = "ACTIVE";
  whereCondition.isDeleted = false;

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
      communityAdmin: { select: { name: true } },
      communityMembers: {
        select: { Community: { select: { name: true } } },
      },
    },
    orderBy: { id: "asc" },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: users,
    pagination: { currentPage: page, totalPages, totalCount, limit },
  };
}

/**
 * ฟังก์ชัน: getUserByStatus
 * วัตถุประสงค์: ดึงข้อมูลผู้ใช้ตามสถานะ (BLOCKED / ACTIVE)
 * Input:
 *   - user: ผู้ใช้ที่ล็อกอิน
 *   - status: สถานะของบัญชี (UserStatus)
 *   - page, limit, searchName
 * Output:
 *   - ข้อมูลผู้ใช้พร้อม pagination
 */
export async function getUserByStatus(
  user: UserPayload,
  status: UserStatus,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> {
  const skip = (page - 1) * limit;
  const whereCondition: any = {};

  if (user.role.toLowerCase() === "superadmin") {
    // เห็นทุกคน
  } else if (user.role.toLowerCase() === "admin") {
    const adminCommunities = await prisma.community.findMany({
      where: { adminId: user.id },
      select: { id: true },
    });
    const communityIds = adminCommunities.map((community) => community.id);

    if (communityIds.length === 0) {
      whereCondition.id = user.id;
    } else {
      whereCondition.memberOfCommunity = { in: communityIds };
    }
  } else {
    whereCondition.id = user.id;
  }

  whereCondition.status = status;
  whereCondition.isDeleted = false;

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
      communityAdmin: { select: { name: true } },
      communityMembers: {
        select: { Community: { select: { name: true } } },
      },
    },
    orderBy: { id: "asc" },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: users,
    pagination: { currentPage: page, totalPages, totalCount, limit },
  };
}

/**
 * ฟังก์ชัน: getUserById
 * วัตถุประสงค์: ดึงข้อมูลผู้ใช้ตาม ID
 */
export async function getUserById(userId: number): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profileImage: true,
      username: true,
      email: true,
      fname: true,
      lname: true,
      phone: true,
      activityRole: true,
      role: { select: { name: true } },
      communityAdmin: { select: { name: true } },
      communityMembers: {
        select: { Community: { select: { name: true } } },
      },
    },
  });

  if (!user) throw new Error("User not found");
  return user;
}

/**
 * ฟังก์ชัน: deleteAccount
 * วัตถุประสงค์: ลบบัญชีผู้ใช้ (Soft Delete)
 */
export async function deleteAccount(userId: number): Promise<any> {
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error("User not found");

  const deletedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });
  return deletedUser;
}

/**
 * ฟังก์ชัน: blockAccount
 * วัตถุประสงค์: บล็อกบัญชีผู้ใช้
 */
export async function blockAccount(userId: number): Promise<any> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.BLOCKED },
    select: { username: true, status: true },
  });
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * ฟังก์ชัน: unblockAccount
 * วัตถุประสงค์: ปลดบล็อกบัญชีผู้ใช้
 */
export async function unblockAccount(userId: number): Promise<any> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.ACTIVE },
    select: { username: true, status: true },
  });
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * ฟังก์ชัน: createAccount
 * วัตถุประสงค์: สร้างบัญชีผู้ใช้ใหม่
 * Input:
 *   - payload: ข้อมูลผู้ใช้
 *   - pathFile: path ของไฟล์รูปโปรไฟล์
 * Output:
 *   - ข้อมูลผู้ใช้ที่สร้างใหม่ (id, username, email, status)
 */
export async function createAccount(
  payload: any,
  pathFile: string
): Promise<any> {
  const user = await prisma.user.create({
    data: {
      ...payload,
      profileImage: pathFile,
    },
    select: {
      id: true,
      username: true,
      email: true,
      status: true,
    },
  });

  return user;
}

/**
 * ฟังก์ชัน: updateProfileImage
 * วัตถุประสงค์: อัปเดตรูปโปรไฟล์ของผู้ใช้ในฐานข้อมูล
 */
export async function updateProfileImage(
  userId: number,
  pathFile: string
): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: pathFile },
    select: {
      id: true,
      username: true,
      email: true,
      profileImage: true,
    },
  });

  return updatedUser;
}

/**
 * ฟังก์ชัน: getMemberByAdmin
 * วัตถุประสงค์: แอดมินสามารถดูข้อมูลสมาชิกในชุมชนที่ตัวเองดูแลได้เท่านั้น
 */
export async function getMemberByAdmin(
  userId: number,
  adminId: number
): Promise<any> {
  const adminCommunities = await prisma.community.findMany({
    where: { adminId },
    select: { id: true },
  });

  const communityIds = adminCommunities.map((community) => community.id);

  if (communityIds.length === 0) {
    throw new Error("คุณไม่มีชุมชนในความดูแล");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profileImage: true,
      username: true,
      email: true,
      fname: true,
      lname: true,
      phone: true,
      activityRole: true,
      role: { select: { name: true } },
      communityMembers: {
        select: { Community: { select: { id: true, name: true } } },
      },
    },
  });

  if (!user) throw new Error("User not found");

  const isMemberInCommunity =
    user.communityMembers?.some(
      (member) => member.Community && communityIds.includes(member.Community.id)
    ) ?? false;

  if (!isMemberInCommunity) {
    throw new Error("คุณไม่มีสิทธิ์ดูข้อมูลผู้ใช้นี้");
  }

  return user;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับรีเซ็ตรหัสผ่านของผู้ใช้ (Forget Password)
 * Input :
 *   - userId (number) : รหัสผู้ใช้ที่ต้องการเปลี่ยนรหัสผ่าน
 *   - newPassword (string) : รหัสผ่านใหม่ที่ยังไม่เข้ารหัส
 * Output :
 *   - ข้อมูลผู้ใช้ที่อัปเดตรหัสผ่านแล้ว (ไม่รวม password)
 */
export async function resetPassword(userId: number, newPassword: PasswordDto) {
  // เข้ารหัสรหัสผ่านด้วย bcrypt
  const hashedPassword = await bcrypt.hash(newPassword.newPassword, 10);

  // อัปเดตรหัสผ่านใหม่ในฐานข้อมูล
  const user = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    select: { id: true, email: true, role: true },
  });

  return user;
}



/* 
 * คำอธิบาย: Service สำหรับเปลี่ยนรหัสผ่านของผู้ใช้งาน
 * ตรวจสอบรหัสผ่านปัจจุบัน เปรียบเทียบรหัสใหม่ และอัปเดตข้อมูลในฐานข้อมูล
 */
/* 
 * Function: changePassword
 * Input : userId (number) → รหัสผู้ใช้ที่ต้องการเปลี่ยนรหัสผ่าน
 *         payload (ChangePasswordDto) → ข้อมูลรหัสผ่านปัจจุบันและรหัสใหม่
 * Output: ข้อมูลผู้ใช้ที่อัปเดตแล้ว (เฉพาะ username)
 */

export async function changePassword(userId: number, payload: any) {
  const { currentPassword, newPassword, confirmNewPassword} = payload

  if (!currentPassword || !newPassword || !confirmNewPassword) throw new Error("Bad payload");
  if (newPassword !== confirmNewPassword) throw new Error("Password mismatch");

  const dataInDb = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      password: true,
    },
  });

  if (!dataInDb) throw new Error("User not found");

  const isPasswordCorrect = await bcrypt.compare(currentPassword, dataInDb.password)
  if (!isPasswordCorrect) throw new Error("Invalid current password");

  if (await bcrypt.compare(newPassword, dataInDb.password))
    throw new Error("New password must be different");

  const newHash = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { password: newHash, },
    select: { username: true },
  });

  return user;
}

/**
 * ฟังก์ชัน : deleteCommunityMember
 * คำอธิบาย : ลบสมาชิกชุมชนแบบ Soft Delete (ไม่ลบข้อมูลออกจากฐานข้อมูลจริง)
 * Input : memberId (number) - รหัสสมาชิกในตาราง communityMembers
 * Output : ข้อมูลสมาชิกที่ถูกลบแบบ Soft Delete
 * Error : หากไม่พบสมาชิก จะ throw Error("Community member not found")
 */
export async function deleteCommunityMember(memberId: number) {
  const target = await prisma.communityMembers.findFirst({
    where: { memberId },
  });

  if (!target) throw new Error("Community member not found");

  return prisma.communityMembers.update({
    where: { id: target.id },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });
}







