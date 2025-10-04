import { Prisma, UserStatus } from "@prisma/client";
import prisma from "./database-service.js";
import type { PaginationResponse } from "~/Libs/Types/pagination-dto.js";

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
 * คำอธิบาย: Service สำหรับสร้างบัญชีผู้ใช้ใหม่
 * บันทึกข้อมูลผู้ใช้และรูปโปรไฟล์ลงในฐานข้อมูล
 */

/* 
 * Function: createAccount
 * Input : payload (object) → ข้อมูลผู้ใช้ เช่น username, email, password, roleId, ฯลฯ
 *         pathFile (string) → path ของไฟล์รูปโปรไฟล์
 * Output: ข้อมูลผู้ใช้ที่สร้างใหม่ (id, username, email, status)
 */
export async function createAccount(payload: any, pathFile: string) {
  const user = await prisma.user.create({
    data: {
      ...payload,
      // roleId: Number(payload.roleId),
      // memberOfCommunity: Number(payload.memberOfCommunity),
      profileImage: pathFile
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