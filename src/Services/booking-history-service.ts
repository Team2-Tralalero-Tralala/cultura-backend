import { PrismaClient } from "@prisma/client";
import type { UserPayload } from "~/Libs/Types/index.js";
const prisma = new PrismaClient();

/*
 * ฟังก์ชัน : getHistoriesByRole
 * คำอธิบาย : ดึงประวัติการจอง (bookingHistory) ตามสิทธิ์ของผู้ใช้งาน
 * Input :
 *   - user : object ที่มีข้อมูลผู้ใช้ (ได้มาจาก middleware authentication)
 * Output :
 *   - Array ของ object ที่ประกอบด้วย:
 *       - ชื่อผู้จอง
 *       - ชื่อกิจกรรม
 *       - ราคา
 *       - สถานะ
 *       - หลักฐานการโอน
 *       - เวลาในการจอง
 */
export const getHistoriesByRole = async (user: UserPayload, page: number = 1,
  limit: number = 10) => {
  let where: any = {};
  if (user.role === "tourist") {
    where = { touristId: user.id };
  } else if (user.role === "member") {
    where = { package: { overseerMemberId: user.id } };
  } else if (user.role === "admin") {
    where = { package: { community: { adminId: user.id } } };
  }

  const data = await prisma.bookingHistory.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where,
    select: {
      tourist: {
        select: { fname: true, lname: true },
      },
      package: {
        select: { name: true, price: true },
      },
      status: true,
      transferSlip: true,
      bookingAt: true,
    },
    orderBy: { bookingAt: "desc" },
  });

  return data;
  
};


