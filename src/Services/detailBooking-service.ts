import { PrismaClient, BookingStatus } from "@prisma/client";
import prisma from "./database-service.js";

/*
 * ฟังก์ชัน : getBookingById
 * คำอธิบาย : ดึงข้อมูลการจองจากตาราง bookingHistory ด้วย id
 * Input : 
 *   - id (number)
 * Output :
 *   - bookingHistory (object | null) : 
 *       - ถ้าพบ : object ของการจองที่ตรงกับ id 
 *       - ถ้าไม่พบ : คืนค่า null
 * Error :
 *    - ถ้า id ไม่ถูกต้องจะไม่เจอข้อมูล 
 */

// ค้นหาข้อมูลการจองจาก bookingHistory ด้วย id
export const getBookingById = async (id: number) => {
  // ถ้าเจอจะคืนค่า object ของการจอง, ถ้าไม่เจอจะคืนค่า null
  return prisma.bookingHistory.findUnique({ where: { id } });
};

