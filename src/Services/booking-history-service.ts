import prisma from "./database-service.js";
import type { UserPayload } from "~/Libs/Types/index.js";

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

export const getDetailBookingById = async (id: number) => {
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

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้าง Booking History ใหม่
 * Input  : 
 *   - data: object {
 *       touristId: number (รหัสผู้จอง),
 *       packageId: number (รหัสแพ็กเกจ),
 *       bookingAt: string (เวลาจอง),
 *       cancelAt?: string | null (เวลายกเลิก),
 *       refundAt?: string | null (เวลาคืนเงิน),
 *       status?: string (สถานะการจอง, ค่าเริ่มต้น "PENDING"),
 *       totalParticipant: number (จำนวนผู้เข้าร่วม),
 *       rejectReason?: string | null (เหตุผลที่ถูกปฏิเสธ)
 *   }
 * Output : BookingHistory object ที่ถูกสร้างใหม่ในฐานข้อมูล
 */
export const createBooking = async(data: any) => {
    const packageId = await prisma.package.findUnique({
        where: { id: Number(data.packageId) }
    });
    if (!packageId) {
        throw new Error(`Package ID ${data.packageId} ไม่พบในระบบ`);
    }

    const userId = await prisma.user.findUnique({
        where: { id: Number(data.touristId) }
    }); 
    if (!userId) {
        throw new Error(`User ID ${data.touristId} ไม่พบในระบบ`);
    }

    return await prisma.bookingHistory.create({
        data : {
            touristId: data.touristId,
            packageId: data.packageId,
            bookingAt: data.bookingAt,
            // cancelAt: data.cancelAt ?? null,
            // refundAt: data.refundAt ?? null,
            status: data.status ?? "PENDING",
            totalParticipant: data.totalParticipant,
            transferSlip: data.transferSlip
            // rejectReason: data.rejectReason ?? null,
        }
    });

}

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

  where.status = {
    in: ["BOOKED", "REJECTED", "REFUNDED", "REFUND_REJECTED"],
  };

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