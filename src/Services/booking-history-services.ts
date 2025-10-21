import { BookingStatus } from "@prisma/client";
import prisma from "./database-service.js";

/**
 * ฟังก์ชัน: getDetailBookingById
 * ----------------------------------------
 * คำอธิบาย:
 *   ใช้สำหรับดึงข้อมูลรายละเอียดการจอง (bookingHistory) จากฐานข้อมูล
 *
 * Input:
 *   - id : รหัสการจอง (BookingID)
 *       1. แปลง id ที่รับเข้ามาให้เป็น number
 *       2. ตรวจสอบว่า id ที่ได้เป็นตัวเลขหรือไม่
 *          ถ้าไม่ใช่ → โยน Error "Incorrect ID"
 *       3. ค้นหาข้อมูลการจองในตาราง bookingHistory โดยใช้ id ที่ถูกต้อง
 *       4. ถ้าไม่พบข้อมูล → โยน Error "Booking not found"
 *
 * Output:
 *   - รายละเอียดของการจอง (booking object)
 *   - Error: กรณี id ไม่ถูกต้องหรือไม่พบข้อมูล
 */

export const getDetailBookingById = async (id: number) => {
  // แปลงและตรวจสอบ ID
  const numberId = Number(id);
  if (isNaN(numberId)) {
    throw new Error("Incorrect ID");
  }

  const booking = await prisma.bookingHistory.findUnique({
    where: { id: numberId, status: BookingStatus.PENDING },
    include: {
      package: {
        select: {
          name: true,
          startDate: true,
          dueDate: true,
          price: true,
          capacity: true,
        },
      },
      tourist: {
        select: {
          fname: true,
          lname: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};
