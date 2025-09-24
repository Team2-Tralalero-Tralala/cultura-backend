/*
 * คำอธิบาย : Service สำหรับจัดการข้อมูลผู้ใช้ (User)
 * ใช้ Prisma เชื่อมต่อฐานข้อมูล เพื่อค้นหาและจัดการข้อมูลผู้ใช้
 * ฟังก์ชันหลัก:
 *   - getUserById : ค้นหาผู้ใช้ตาม id
 *   - getUserByStatus : ค้นหาผู้ใช้ตามสถานะ (ACTIVE, BLOCKED, ฯลฯ)
 *   - deleteAccount : ลบผู้ใช้ตาม id
 *   - blockAccount : สลับสถานะผู้ใช้ (ACTIVE <-> BLOCKED)
 */

import type { UserStatus } from "@prisma/client";
import prisma from "./database-service.js";

/*
 * ฟังก์ชัน : getUserById
 * คำอธิบาย : ค้นหาผู้ใช้จาก id ที่กำหนด
 * Input : id (number) - รหัสผู้ใช้
 * Output : user (object) - ข้อมูลผู้ใช้ที่พบ (username, email, fname, lname, phone, activityRole)
 * Error : throw error ถ้าไม่พบผู้ใช้
 */
export async function getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
          username: true,
          email: true,
          fname: true,
          lname: true,
          phone: true,
          activityRole: true,
      },
    });
    if (!user) throw new Error("User not found");
    return user;
}

/*
 * ฟังก์ชัน : getUserByStatus
 * คำอธิบาย : ค้นหาผู้ใช้ทั้งหมดที่มีสถานะตรงกับที่ระบุ
 * Input : status (UserStatus) - สถานะผู้ใช้ เช่น ACTIVE, BLOCKED
 * Output : users (array) - รายชื่อผู้ใช้ที่มีสถานะตรงตามเงื่อนไข (username, activityRole, email)
 */
export async function getUserByStatus(status: UserStatus) {
    const users = await prisma.user.findMany({
      where: { status },
      select: {
          username: true,
          activityRole: true,
          email: true,
      },
    });
    return users;
}

/*
 * ฟังก์ชัน : deleteAccount
 * คำอธิบาย : ลบผู้ใช้จากฐานข้อมูลตาม id ที่กำหนด
 * Input : id (number) - รหัสผู้ใช้
 */

export async function deleteAccount(id: number) {
    const user = await prisma.user.deleteMany({
      where: { id },
    });
}

/*
 * ฟังก์ชัน : blockAccount
 * คำอธิบาย : สลับสถานะผู้ใช้จาก ACTIVE เป็น BLOCKED หรือ BLOCKED เป็น ACTIVE ตาม id ที่กำหนด
 * Input : id (number) - รหัสผู้ใช้
 * Output : updatedUser (object) - ข้อมูลผู้ใช้ที่ถูกอัปเดตพร้อมสถานะใหม่
 * Error : throw error ถ้าไม่พบผู้ใช้
 */
export async function blockAccount(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!user) throw new Error("User not found");

    const newStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: {
        username: true, 
        status: true
      },
    });

    return updatedUser;
}