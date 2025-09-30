import prisma from "./database-service.js";
/*
 * คำอธิบาย : ฟังก์ชันสำหรับการดึงข้อมูลรายละเอียดการจอง (bookingHistory)
 * Input :
 *   - id : รหัสการจอง (BookingID) ที่รับเข้ามา
 *          1. แปลง id ที่รับเข้ามาให้เป็น number
 *          2. ตรวจสอบว่า id ที่ได้เป็นตัวเลขหรือไม่ ถ้าไม่ใช่ จะแสดงข้อความว่า "Incorrect ID"
 *          3. ค้นหาข้อมูลการจองในตาราง bookingHistory โดยใช้ id ที่ถูกต้อง
 *          4. ถ้าไม่พบข้อมูล จะแสดงข้อความว่า "Booking not found"
 * Output :
 *   - รายละเอียดการจองที่พบ
 *   - Error จะเกิดขึ้นเมื่อกรณี id ไม่ถูกต้องหรือไม่พบข้อมูลการจอง
 */

export const getDetailBooking = async (id: any) => {
  const numberId = Number(id);

  if (isNaN(numberId)) {
    throw new Error("Incorrect ID");
  }
  const booking = await prisma.bookingHistory.findUnique({
    where: { id: numberId },
  });
  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
};
