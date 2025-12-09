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