import { Prisma, UserStatus } from "@prisma/client";
import prisma from "./database-service.js";
import type { PaginationResponse } from "~/Libs/Types/pagination-dto.js";
import type { ChangePasswordDto } from "~/Controllers/user-controller.js";
import bcrypt from 'bcrypt';

/*
 * ฟังก์ชัน : getUserById
 * คำอธิบาย : ดึงข้อมูลผู้ใช้จากฐานข้อมูลตาม id
 * Input :
 *   - id (number) : รหัสผู้ใช้
 * Output :
 *   - Object ที่มีข้อมูลผู้ใช้ (profileImage, username, email, fname, lname, phone, activityRole, role(name))
 *   - Error "User not found" ถ้าไม่พบผู้ใช้
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
          role: {
                select: {
                    name: true,
                },
          },
          memberOf: {
                select: {
                    name: true,
                },
          },
      },
    });
    if (!user) throw new Error("User not found");
    return user;
}

/*
 * ฟังก์ชัน : getUserByStatus
 * คำอธิบาย : ดึงข้อมูลผู้ใช้ตามสถานะ (status) พร้อมรองรับการแบ่งหน้า (pagination)
 * Input :
 *   - status (UserStatus) : สถานะผู้ใช้ (เช่น ACTIVE, BLOCKED)
 *   - page (number, default = 1) : หน้าที่ต้องการ
 *   - limit (number, default = 10) : จำนวนข้อมูลต่อหน้า
 * Output :
 *   - Object : { data, pagination }
 *       data : ข้อมูลผู้ใช้ที่ดึงมา (id, username, activityRole, email)
 *       pagination : { currentPage, totalPages, totalCount, limit }
 */

export async function getUserByStatus(
  status: UserStatus,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> {
    const skip = (page - 1) * limit;

    // นับจำนวนผู้ใช้ทั้งหมดตาม status
    const totalCount = await prisma.user.count({
        where: { status },
    });

    // ดึงข้อมูลผู้ใช้ตามหน้า
    const users = await prisma.user.findMany({
        where: { status },
        select: {
            id: true,
            username: true,
            activityRole: true,
            email: true,
        },
        orderBy: { id: "desc" },
        skip,
        take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
        data: users,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
        },
    };
}

/*
 * ฟังก์ชัน : deleteAccount
 * คำอธิบาย : ลบข้อมูลผู้ใช้จากฐานข้อมูลตาม userId
 * Input :
 *   - userId (number) : รหัสผู้ใช้
 * Output :
 *   - Object : ข้อมูลผู้ใช้ที่ถูกลบ
 *   - Error "User not found" ถ้าไม่พบผู้ใช้
 */

export async function deleteAccount(userId: number) {
    const findUser = await prisma.user.findUnique({
      where: { id: userId}
    })
    if (!findUser) throw new Error("User not found");

    try {
      return await prisma.user.delete({
        where: { id: userId}
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
        throw new Error("Cannot delete user: user is still linked to other records");
        }
      }
      throw error;
    }
}

/*
 * ฟังก์ชัน : blockAccount
 * คำอธิบาย : เปลี่ยนสถานะผู้ใช้เป็น BLOCKED
 * Input :
 *   - id (number) : รหัสผู้ใช้
 * Output :
 *   - Object : { username, status }
 *   - Error "User not found" ถ้าไม่พบผู้ใช้
 */

export async function blockAccount(userId: number) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.BLOCKED },
      select: { 
        username: true,
        status: true,
      },
    });
    if (!user) throw new Error("User not found");

    return user;
}

/*
 * ฟังก์ชัน : unblockAccount
 * คำอธิบาย : เปลี่ยนสถานะผู้ใช้เป็น ACTIVE
 * Input :
 *   - id (number) : รหัสผู้ใช้
 * Output :
 *   - Object : { username, status }
 *   - Error "User not found" ถ้าไม่พบผู้ใช้
 */

export async function unblockAccount(userId: number) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
      select: { 
        username: true,
        status: true,
      },
    });
    if (!user) throw new Error("User not found");

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

export async function changePassword(userId: number, payload: ChangePasswordDto) {
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