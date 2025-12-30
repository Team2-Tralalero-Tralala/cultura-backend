import { PackageApproveStatus, PackagePublishStatus } from "@prisma/client";
import prisma from "~/Services/database-service.js";
import type { PaginationResponse } from "~/Services/pagination-dto.js";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายการคำขอคืนเงินทั้งหมดของชุมชนที่ผู้ดูแลดูแลอยู่
 * Input :
 *   - userId (number) : รหัสของผู้ใช้ที่ล็อกอิน (admin)
 *   - page (number) : หน้าที่ต้องการแสดง (ค่าเริ่มต้น = 1)
 *   - limit (number) : จำนวนรายการต่อหน้า (ค่าเริ่มต้น = 10)
 * Output :
 *   - PaginationResponse : ข้อมูลรายการคำขอคืนเงิน พร้อม pagination metadata
 */
export const getRefundRequestsByAdmin = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(userId)) throw new Error("ID must be Number");

  // ตรวจสอบว่า user เป็น admin จริง
  const admin = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!admin) throw new Error("User not found");
  if (admin.role?.name.toLowerCase() !== "admin") {
    return {
      data: [],
      pagination: { currentPage: page, totalPages: 0, totalCount: 0, limit },
    };
  }

  // ตรวจสอบว่าผู้ใช้ดูแลชุมชนใดอยู่
  const community = await prisma.community.findFirst({
    where: { adminId: userId, isDeleted: false },
    select: { id: true },
  });
  if (!community) throw new Error("ไม่พบชุมชนที่ผู้ดูแลนี้ดูแลอยู่");

  const skip = (page - 1) * limit;

  // นับจำนวนคำขอคืนเงินทั้งหมดของชุมชนนั้น
  const totalCount = await prisma.bookingHistory.count({
    where: {
      status: "REFUND_PENDING",
      package: { communityId: community.id },
    },
  });

  // ดึงรายการคำขอคืนเงินของชุมชน (พร้อมข้อมูลนักท่องเที่ยวและแพ็กเกจ)
  const refundRequests = await prisma.bookingHistory.findMany({
    where: {
      status: "REFUND_PENDING",
      package: { communityId: community.id },
    },
    orderBy: { id: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      status: true,
      totalParticipant: true,
      transferSlip: true,
      tourist: { select: { fname: true, lname: true } },
      package: { select: { name: true, price: true } },
    },
  });

  return {
    data: refundRequests,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
    },
  };
};

/*
 * คำอธิบาย : ฟังก์ชันสำหรับอนุมัติคำขอคืนเงิน
 * Input :
 *   - userId (number) : รหัสผู้ใช้ที่ล็อกอิน (admin)
 *   - bookingId (number) : รหัสคำขอคืนเงินที่ต้องการอนุมัติ
 * Output :
 *   - Object BookingHistory ที่ถูกอัปเดตสถานะเป็น REFUNDED
 */
export async function approveRefundByAdmin(
  userId: number,
  bookingId: number
) {
  const booking = await prisma.bookingHistory.findFirst({
    where: {
      id: bookingId,
      status: "REFUND_PENDING",
      package: { community: { adminId: userId, isDeleted: false } },
    },
  });
  if (!booking) throw new Error("ไม่พบคำขอคืนเงินนี้ หรือไม่มีสิทธิ์จัดการ");

  const updatedBooking = await prisma.bookingHistory.update({
    where: { id: bookingId },
    data: { status: "REFUNDED", refundAt: new Date() },
  });

  return updatedBooking;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับปฏิเสธคำขอคืนเงิน
 * Input :
 *   - userId (number) : รหัสผู้ใช้ที่ล็อกอิน (admin)
 *   - bookingId (number) : รหัสคำขอคืนเงินที่ต้องการปฏิเสธ
 *   - reason (string?) : เหตุผลในการปฏิเสธ (ระบุหรือไม่ระบุก็ได้)
 * Output :
 *   - Object BookingHistory ที่ถูกอัปเดตสถานะเป็น REFUND_REJECTED
 */
export async function rejectRefundByAdmin(
  userId: number,
  bookingId: number,
  reason?: string
) {
  const booking = await prisma.bookingHistory.findFirst({
    where: {
      id: bookingId,
      status: "REFUND_PENDING",
      package: { community: { adminId: userId, isDeleted: false } },
    },
  });
  if (!booking) throw new Error("ไม่พบคำขอคืนเงินนี้ หรือไม่มีสิทธิ์จัดการ");

  const updatedBooking = await prisma.bookingHistory.update({
    where: { id: bookingId },
    data: {
      status: "REFUND_REJECTED",
      rejectReason: reason ?? "ไม่ระบุเหตุผล",
      cancelAt: new Date(),
    },
  });

  return updatedBooking;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายการคำขอคืนเงินทั้งหมดของ 'Package ที่ Member เป็นผู้ดูแล'
 * Input :
 * - userId (number) : รหัสของผู้ใช้ที่ล็อกอิน (Member)
 * - page (number) : หน้าที่ต้องการแสดง (ค่าเริ่มต้น = 1)
 * - limit (number) : จำนวนรายการต่อหน้า (ค่าเริ่มต้น = 10)
 * Output :
 * - PaginationResponse : ข้อมูลรายการคำขอคืนเงิน พร้อม pagination metadata
 */
export const getRefundRequestsByMember = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(userId)) throw new Error("ID must be Number");

  // ตรวจสอบว่า user เป็น member จริง
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");
  
  // ตรวจสอบ Role ต้องเป็น MEMBER
  if (user.role?.name.toLowerCase() !== "member") {
    return {
      data: [],
      pagination: { currentPage: page, totalPages: 0, totalCount: 0, limit },
    };
  }
  
  const skip = (page - 1) * limit;
  

  const totalCount = await prisma.bookingHistory.count({
    where: {
      status: "REFUND_PENDING",
      package: { 
        overseerMemberId: userId 
      },
    },
  });

  // ดึงรายการคำขอคืนเงิน
  const refundRequests = await prisma.bookingHistory.findMany({
    where: {
      status: "REFUND_PENDING",
      package: { 
        overseerMemberId: userId 
      },
    },
    orderBy: { id: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      status: true,
      totalParticipant: true,
      transferSlip: true,
      tourist: { select: { fname: true, lname: true } },
      package: { select: { name: true, price: true } },
    },
  });

  return {
    data: refundRequests,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
    },
  };
};

/*
 * คำอธิบาย : ฟังก์ชันสำหรับอนุมัติคำขอคืนเงิน (โดย Member ผู้ดูแล)
 * Input :
 * - userId (number) : รหัสผู้ใช้ที่ล็อกอิน (Member)
 * - bookingId (number) : รหัสคำขอคืนเงินที่ต้องการอนุมัติ
 * Output :
 * - Object BookingHistory ที่ถูกอัปเดตสถานะเป็น REFUNDED
 */
export async function approveRefundByMember(
  userId: number,
  bookingId: number
) {
  // ตรวจสอบสิทธิ์: ต้องเป็น Booking ของ Package ที่ Member คนนี้ดูแล (overseerMemberId)
  const booking = await prisma.bookingHistory.findFirst({
    where: {
      id: bookingId,
      status: "REFUND_PENDING",
      package: { 
        overseerMemberId: userId // เช็คว่าเป็นผู้ดูแล Package นี้หรือไม่
      },
    },
  });

  if (!booking) throw new Error("ไม่พบคำขอคืนเงินนี้ หรือไม่มีสิทธิ์จัดการ");

  // อัปเดตสถานะเป็น REFUNDED
  const updatedBooking = await prisma.bookingHistory.update({
    where: { id: bookingId },
    data: { status: "REFUNDED", refundAt: new Date() },
  });

  return updatedBooking;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับปฏิเสธคำขอคืนเงิน (โดย Member ผู้ดูแล)
 * Input :
 * - userId (number) : รหัสผู้ใช้ที่ล็อกอิน (Member)
 * - bookingId (number) : รหัสคำขอคืนเงินที่ต้องการปฏิเสธ
 * - reason (string?) : เหตุผลในการปฏิเสธ (ระบุหรือไม่ระบุก็ได้)
 * Output :
 * - Object BookingHistory ที่ถูกอัปเดตสถานะเป็น REFUND_REJECTED
 */
export async function rejectRefundByMember(
  userId: number,
  bookingId: number,
  reason?: string
) {
  // ตรวจสอบสิทธิ์: ต้องเป็น Booking ของ Package ที่ Member คนนี้ดูแล (overseerMemberId)
  const booking = await prisma.bookingHistory.findFirst({
    where: {
      id: bookingId,
      status: "REFUND_PENDING",
      package: { 
        overseerMemberId: userId // เช็คว่าเป็นผู้ดูแล Package นี้หรือไม่
      },
    },
  });

  if (!booking) throw new Error("ไม่พบคำขอคืนเงินนี้ หรือไม่มีสิทธิ์จัดการ");

  // อัปเดตสถานะเป็น REFUND_REJECTED พร้อมเหตุผล
  const updatedBooking = await prisma.bookingHistory.update({
    where: { id: bookingId },
    data: {
      status: "REFUND_REJECTED",
      rejectReason: reason ?? "ไม่ระบุเหตุผล",
      cancelAt: new Date(),
    },
  });

  return updatedBooking;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้าง Booking History ใหม่ (สำหรับ Tourist)
 * Input :
 *   - touristId (number) - รหัสผู้จอง (นักท่องเที่ยว)
 *   - packageId (number) - รหัสแพ็กเกจที่ต้องการจอง
 *   - totalParticipant (number) - จำนวนผู้เข้าร่วม
 *   - transferSlip (string | undefined) - หลักฐานการโอนเงิน (optional)
 *   - touristBankId (number | undefined) - รหัสบัญชีธนาคารของนักท่องเที่ยว (optional)
 * Output : BookingHistory object ที่ถูกสร้างใหม่ในฐานข้อมูล
 * 
 * เงื่อนไข:
 *   - ตรวจสอบว่าแพ็กเกจมีอยู่จริงและพร้อมให้จอง (PUBLISH, APPROVE)
 *   - ตรวจสอบว่าผู้ใช้เป็น Tourist จริง
 *   - สถานะเริ่มต้นเป็น PENDING
 */
export async function createTouristBooking(
  touristId: number,
  packageId: number,
  totalParticipant: number,
  transferSlip?: string,
  touristBankId?: number
) {
  // ตรวจสอบว่า tourist มีอยู่จริงและเป็น tourist
  const tourist = await prisma.user.findUnique({
    where: { id: touristId },
    include: { role: true },
  });

  if (!tourist) {
    throw new Error("ไม่พบข้อมูลผู้ใช้");
  }

  if (tourist.role?.name.toLowerCase() !== "tourist") {
    throw new Error("ผู้ใช้ต้องเป็น Tourist เท่านั้น");
  }

  // ตรวจสอบว่าแพ็กเกจมีอยู่จริงและพร้อมให้จอง
  const packageData = await prisma.package.findUnique({
    where: { id: packageId },
    select: {
      id: true,
      name: true,
      statusPackage: true,
      statusApprove: true,
      isDeleted: true,
      capacity: true,
      price: true,
    },
  });

  if (!packageData) {
    throw new Error("ไม่พบแพ็กเกจที่ระบุ");
  }

  if (packageData.isDeleted) {
    throw new Error("แพ็กเกจนี้ถูกลบแล้ว");
  }

  if (packageData.statusPackage !== PackagePublishStatus.PUBLISH) {
    throw new Error("แพ็กเกจนี้ยังไม่เปิดให้จอง");
  }

  if (packageData.statusApprove !== PackageApproveStatus.APPROVE) {
    throw new Error("แพ็กเกจนี้ยังไม่ได้รับการอนุมัติ");
  }

  // ตรวจสอบความจุ (capacity)
  if (packageData.capacity !== null && totalParticipant > packageData.capacity) {
    throw new Error(`จำนวนผู้เข้าร่วมเกินความจุของแพ็กเกจ (ความจุ: ${packageData.capacity} คน)`);
  }

  // ตรวจสอบจำนวนผู้เข้าร่วมต้องมากกว่า 0
  if (totalParticipant < 1) {
    throw new Error("จำนวนผู้เข้าร่วมต้องมากกว่าหรือเท่ากับ 1");
  }

  // สร้าง Booking History
  const booking = await prisma.bookingHistory.create({
    data: {
      touristId,
      packageId,
      totalParticipant,
      bookingAt: new Date(),
      status: "PENDING",
      transferSlip: transferSlip || null,
      touristBankId: touristBankId || null,
    },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          price: true,
        },
      },
      tourist: {
        select: {
          id: true,
          fname: true,
          lname: true,
        },
      },
    },
  });

  return booking;
}