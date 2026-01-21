import prisma from "../database-service.js";
import { BookingStatus, ImageType } from "@prisma/client";
import type { Location, PackageFile } from "@prisma/client";
import type { UserPayload } from "~/Libs/Types/index.js";
import type { PaginationResponse } from "../pagination-dto.js";

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
    include: {
      package: {
        select: { name: true },
      },
    },
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
export const createBooking = async (data: any) => {
  const packageId = await prisma.package.findUnique({
    where: { id: Number(data.packageId) },
  });
  if (!packageId) {
    throw new Error(`Package ID ${data.packageId} ไม่พบในระบบ`);
  }

  const userId = await prisma.user.findUnique({
    where: { id: Number(data.touristId) },
  });
  if (!userId) {
    throw new Error(`User ID ${data.touristId} ไม่พบในระบบ`);
  }

  return await prisma.bookingHistory.create({
    data: {
      touristId: data.touristId,
      packageId: data.packageId,
      bookingAt: data.bookingAt,
      // cancelAt: data.cancelAt ?? null,
      // refundAt: data.refundAt ?? null,
      status: data.status ?? "PENDING",
      totalParticipant: data.totalParticipant,
      transferSlip: data.transferSlip,
      // rejectReason: data.rejectReason ?? null,
    },
  });
};

/**
 * คำอธิบาย : ดึงประวัติการจอง (Booking History) ตาม role ของผู้ใช้งาน
 * Input :
 *  - user : UserPayload (ข้อมูลผู้ใช้งานที่ล็อกอิน)
 *  - page : number (หมายเลขหน้า, default = 1)
 *  - limit : number (จำนวนรายการต่อหน้า, default = 10)
 * Output :
 *  - รายการ bookingHistory ที่มีสถานะ:
 *    BOOKED, REJECTED, REFUNDED, REFUND_REJECTED
 */
export const getHistoriesByRole = async (
  user: UserPayload,
  page: number = 1,
  limit: number = 10
) => {
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

export const getDetailBooking = async (id: number) => {
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

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายการการจองทั้งหมดของแพ็กเกจในชุมชน (เฉพาะ Admin)
 * Input :
 *   - adminId (number) : รหัสผู้ดูแลที่ร้องขอ (ต้องเป็น Admin)
 *   - page (number) : หน้าปัจจุบัน
 *   - limit (number) : จำนวนต่อหน้า
 * Output :
 *   - PaginationResponse : ข้อมูลรายการการจองทั้งหมดของแพ็กเกจในชุมชน พร้อม pagination
 */
export const getBookingsByAdmin = async (
  adminId: number,
  page = 1,
  limit = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(adminId)) throw new Error("ID must be Number");

  // ตรวจสอบสิทธิ์ผู้ใช้
  const user = await prisma.user.findUnique({
    where: { id: adminId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role?.name?.toLowerCase() !== "admin") {
    return {
      data: [],
      pagination: { currentPage: page, totalPages: 0, totalCount: 0, limit },
    };
  }

  // ตรวจสอบว่าแอดมินมีชุมชนอยู่จริง
  const community = await prisma.community.findFirst({
    where: { adminId, isDeleted: false },
    select: { id: true },
  });
  if (!community) throw new Error("ไม่พบชุมชนที่ผู้ดูแลนี้ดูแลอยู่");

  // คำนวณ pagination
  const skip = (page - 1) * limit;

  // นับจำนวนทั้งหมดของการจองในชุมชนนี้ (PENDING หรือ REFUND_PENDING)
  const totalCount = await prisma.bookingHistory.count({
    where: {
      package: {
        communityId: community.id,
        isDeleted: false,
      },
      status: { in: ["PENDING", "REFUND_PENDING"] }, // เพิ่ม filter
    },
  });

  // ดึงข้อมูลการจอง พร้อม tourist และ package
  const bookings = await prisma.bookingHistory.findMany({
    where: {
      package: {
        communityId: community.id,
        isDeleted: false,
      },
      status: { in: ["PENDING", "REFUND_PENDING"] },
    },
    orderBy: { bookingAt: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      tourist: {
        select: {
          fname: true,
          lname: true,
        },
      },
      package: {
        select: {
          name: true,
          price: true,
        },
      },
      totalParticipant: true,
      status: true,
      transferSlip: true,
    },
  });

  // คำนวณราคารวม = ราคาแพ็กเกจ * จำนวนผู้เข้าร่วม
  const result = bookings.map((b) => ({
    id: b.id,
    tourist: b.tourist,
    package: b.package,
    totalPrice: (b.package?.price ?? 0) * (b.totalParticipant ?? 0),
    status: b.status,
    transferSlip: b.transferSlip,
  }));

  // ส่งผลลัพธ์พร้อม pagination
  return {
    data: result,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
    },
  };
};

/*
 * ฟังก์ชัน : updateBookingStatus
 * คำอธิบาย : อัปเดตสถานะของการจอง + จัดการเหตุผลการปฏิเสธ (rejectReason)
 * เงื่อนไข :
 *   - สถานะที่อนุญาต: BOOKED, REJECTED, REFUNDED, REFUND_REJECTED
 *   - ถ้าเป็นสถานะปฏิเสธ (REJECTED, REFUND_REJECTED) → สามารถเซต rejectReason ได้
 *   - ถ้าไม่ใช่สถานะปฏิเสธ → ล้าง rejectReason ให้เป็น null
 */

export const updateBookingStatus = async (
  id: number,
  newStatus: string,
  rejectReason?: string
) => {
  const validStatuses = ["BOOKED", "REJECTED", "REFUNDED", "REFUND_REJECTED"];

  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid booking status");
  }

  const isRejectStatus =
    newStatus === "REJECTED" || newStatus === "REFUND_REJECTED";

  // ถ้าเป็นสถานะปฏิเสธ → ต้องมีเหตุผล และห้ามเป็นสตริงว่าง
  let rejectReasonValue: string | null = null;
  if (isRejectStatus) {
    const trimmed = (rejectReason ?? "").trim();
    if (!trimmed) {
      throw new Error("Reject reason is required");
    }
    rejectReasonValue = trimmed;
  } else {
    // ถ้าไม่ใช่สถานะปฏิเสธ → ล้าง reason ทิ้ง
    rejectReasonValue = null;
  }

  const booking = await prisma.bookingHistory.update({
    where: { id },
    data: {
      status: newStatus as BookingStatus,
      rejectReason: rejectReasonValue,
    },
  });

  return booking;
};

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายการการจองเฉพาะแพ็กเกจที่ Member คนนั้นเป็นผู้ดูแล (เฉพาะ Member)
 * Input :
 *   - memberId (number) : รหัสสมาชิกที่ร้องขอ (ต้องเป็น Member)
 *   - page (number) : หน้าปัจจุบัน
 *   - limit (number) : จำนวนต่อหน้า
 *   - status (string | undefined) : สถานะที่ต้องการกรอง (เช่น PENDING, REFUND_PENDING หรือ PENDING,REFUND_PENDING)
 * Output :
 *   - PaginationResponse : ข้อมูลรายการการจองเฉพาะแพ็กเกจที่ member คนนั้นดูแล พร้อม pagination
 */
export const getBookingsByMember = async (
  memberId: number,
  page = 1,
  limit = 10,
  status?: string
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(memberId)) throw new Error("ID must be Number");

  // ตรวจสอบสิทธิ์ผู้ใช้
  const user = await prisma.user.findUnique({
    where: { id: memberId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");

  if (user.role?.name?.toLowerCase() !== "member") {
    return {
      data: [],
      pagination: { currentPage: page, totalPages: 0, totalCount: 0, limit },
    };
  }

  // คำนวณ pagination
  const skip = (page - 1) * limit;

  // filter
  let statusFilter: BookingStatus | { in: BookingStatus[] } | undefined;

  if (status) {
    // รองรับหลายค่า เช่น ?status=PENDING,REFUND_PENDING
    const statuses = status
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as BookingStatus[];

    if (statuses.length === 1) {
      statusFilter = statuses[0]; // status: "PENDING"
    } else if (statuses.length > 1) {
      statusFilter = { in: statuses }; // status: { in: ["PENDING", "REFUND_PENDING"] }
    }
  } else {
    // ถ้าไม่ส่ง status มาเลย → ใช้ค่าเดิม PENDING + REFUND_PENDING
    statusFilter = {
      in: ["PENDING", "REFUND_PENDING"] as BookingStatus[],
    };
  }

  const baseWhere: any = {
    package: {
      overseerMemberId: memberId,
      isDeleted: false,
    },
  };

  if (statusFilter) {
    baseWhere.status = statusFilter;
  }

  // นับจำนวนทั้งหมดของการจอง
  const totalCount = await prisma.bookingHistory.count({
    where: baseWhere,
  });

  // ดึงข้อมูลการจอง พร้อม tourist และ package
  const bookings = await prisma.bookingHistory.findMany({
    where: baseWhere,
    orderBy: { bookingAt: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      tourist: {
        select: {
          fname: true,
          lname: true,
        },
      },
      package: {
        select: {
          name: true,
          price: true,
        },
      },
      totalParticipant: true,
      status: true,
      transferSlip: true,
    },
  });

  // คำนวณราคารวม = ราคาแพ็กเกจ * จำนวนผู้เข้าร่วม
  const result = bookings.map((booking) => ({
    id: booking.id,
    tourist: booking.tourist,
    package: booking.package,
    totalPrice: (booking.package?.price ?? 0) * (booking.totalParticipant ?? 0),
    status: booking.status,
    transferSlip: booking.transferSlip,
  }));

  // ส่งผลลัพธ์พร้อม pagination
  return {
    data: result,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
    },
  };
};

/*
 * ฟังก์ชัน : updateBookingStatusByMember
 * คำอธิบาย : อัปเดตสถานะของการจอง + จัดการเหตุผลการปฏิเสธ (rejectReason)
 * เฉพาะแพ็กเกจที่ Member คนนั้นเป็นผู้ดูแล (overseerMember)
 * เงื่อนไข :
 *   - สถานะที่อนุญาต: BOOKED, REJECTED, REFUNDED, REFUND_REJECTED
 *   - ถ้าเป็นสถานะปฏิเสธ (REJECTED, REFUND_REJECTED) → ต้องมี rejectReason (ห้ามสตริงว่าง)
 *   - ถ้าไม่ใช่สถานะปฏิเสธ → ล้าง rejectReason เป็น null
 *   - อัปเดตได้เฉพาะ booking ที่ผูกกับ package ที่ overseerMemberId = memberId
 */
export const updateBookingStatusByMember = async (
  memberId: number,
  bookingId: number,
  newStatus: string,
  rejectReason?: string
) => {
  if (!Number.isInteger(memberId) || memberId <= 0) {
    throw new Error("memberId must be Number");
  }
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    throw new Error("bookingId must be Number");
  }

  const user = await prisma.user.findUnique({
    where: { id: memberId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role?.name?.toLowerCase() !== "member") {
    throw new Error("Forbidden: only member can update booking status");
  }

  const validStatuses: BookingStatus[] = [
    "BOOKED",
    "REJECTED",
    "REFUNDED",
    "REFUND_REJECTED",
  ];

  if (!validStatuses.includes(newStatus as BookingStatus)) {
    throw new Error("Invalid booking status");
  }

  const isRejectStatus =
    newStatus === "REJECTED" || newStatus === "REFUND_REJECTED";

  let rejectReasonValue: string | null = null;
  if (isRejectStatus) {
    const trimmed = (rejectReason ?? "").trim();
    if (!trimmed) {
      throw new Error("Reject reason is required");
    }
    rejectReasonValue = trimmed;
  } else {
    rejectReasonValue = null;
  }

  const booking = await prisma.bookingHistory.findFirst({
    where: {
      id: bookingId,
      package: {
        overseerMemberId: memberId,
        isDeleted: false,
      },
    },
    select: { id: true },
  });

  if (!booking) {
    throw new Error(
      "Booking not found or not belong to this member's packages"
    );
  }

  const updated = await prisma.bookingHistory.update({
    where: { id: booking.id },
    data: {
      status: newStatus as BookingStatus,
      rejectReason: rejectReasonValue,
    },
  });

  return updated;
};
/*
 * ฟังก์ชัน : getMemberBookingHistories
 * คำอธิบาย : ฟังก์ชันสำหรับดึงประวัติการจองของแพ็กเกจที่ Member คนนั้นเป็นผู้ดูแล
 * Input :
 *   - memberId (number) : รหัสสมาชิกที่ร้องขอ (ต้องเป็น Member)
 *   - page (number) : หน้าปัจจุบัน
 *   - limit (number) : จำนวนต่อหน้า
 *   - status (string | undefined) : สถานะที่ต้องการกรอง (เช่น BOOKED, REJECTED หรือ ALL)
 * Output :
 *   - PaginationResponse : ข้อมูลรายการประวัติการจองของแพ็กเกจที่ member คนนั้นดูแล พร้อม pagination
 */
export const getMemberBookingHistories = async (
  memberId: number,
  page: number,
  limit: number,
  status?: string
) => {
  // 1. เงื่อนไขพื้นฐาน: ดึงเฉพาะแพ็กเกจที่ Member นี้ดูแล
  const whereCondition: any = {
    package: {
      overseerMemberId: memberId,
      isDeleted: false,
    },
  };

  // 2. Logic จัดการ Status

  // กำหนดสถานะที่เรา 'อนุญาต' ให้แสดงในหน้านี้ (ตัด PENDING, REFUND_PENDING ออก)
  const visibleStatuses = ["BOOKED", "REJECTED", "REFUNDED", "REFUND_REJECTED"];

  if (status && status !== "ALL") {
    // กรณีมีการเลือกสถานะเจาะจง
    const statusArray = status.split(",").map((s) => s.trim());
    // (Optional) อาจจะเช็คเพิ่มก็ได้ว่า statusArray ต้องอยู่ใน visibleStatuses ไหม
    whereCondition.status = { in: statusArray };
  } else {
    // กรณีเป็น 'ALL' หรือไม่ได้ส่งมา
    whereCondition.status = { in: visibleStatuses };
  }

  // 3. ดึงข้อมูล
  const totalCount = await prisma.bookingHistory.count({
    where: whereCondition,
  });
  const bookings = await prisma.bookingHistory.findMany({
    where: whereCondition,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { bookingAt: "desc" },
    select: {
      id: true,
      bookingAt: true,
      status: true,
      transferSlip: true,
      totalParticipant: true,
      tourist: { select: { fname: true, lname: true, profileImage: true } },
      package: { select: { name: true, price: true } },
    },
  });

  // 4. จัด Format ให้ตรงกับตารางหน้าเว็บ
  const result = bookings.map((item) => ({
    id: item.id,
    bookerName: `${item.tourist.fname} ${item.tourist.lname}`,
    eventName: item.package?.name || "ไม่ระบุ",
    totalPrice: (item.package?.price || 0) * item.totalParticipant,
    status: item.status,
    slipUrl: item.transferSlip,
    bookingDate: item.bookingAt,
  }));

  return {
    data: result,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
    },
  };
};
/**
 * คำอธิบาย : ประเภทข้อมูลประวัติการจองของผู้ที่เข้าร่วมแพ็กเกจ
 */
type TouristBookingHistory = {
  id: number;
  bookingAt: Date;
  status: BookingStatus | null;
  totalParticipant: number;
  package: {
    name: string | null;
    price: number | null;
    description: string | null;
    startDate: Date | null;
    dueDate: Date | null;
    packageFile: PackageFile[];
    community: {
      name: string;
      location: Location;
    };
  } | null;
};
/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงประวัติการจองของผู้ที่เข้าร่วมแพ็กเกจ
 * Input :
 *   - touristId (number) : รหัสผู้ที่เข้าร่วมแพ็กเกจ
 *   - page (number) : หน้าปัจจุบัน
 *   - limit (number) : จำนวนต่อหน้า
 *   - sort ("asc" | "desc") : ลำดับ
 *   - filter (object) : ตัวกรอง
 * Output :
 *   - PaginationResponse : ข้อมูลรายการประวัติการจองของผู้ที่เข้าร่วมแพ็กเกจ พร้อม pagination
 */
export async function getTouristBookingHistory(
  touristId: number,
  page: number = 1,
  limit: number = 10,
  sort: "asc" | "desc",
  filter?: {
    status?: string[];
    date?: {
      from: Date;
      to: Date;
    };
  }
): Promise<PaginationResponse<TouristBookingHistory>> {
  const skip = (page - 1) * limit;
  const whereCondition: any = { touristId };

  if (filter?.status) {
    whereCondition.status = { in: filter.status as BookingStatus[] };
  }
  if (filter?.date) {
    whereCondition.bookingAt = {
      gte: filter.date.from,
      lte: filter.date.to,
    };
  }

  const bookingHistories = await prisma.bookingHistory.findMany({
    where: whereCondition,
    orderBy: { bookingAt: sort },
    select: {
      id: true,
      bookingAt: true,
      status: true,
      totalParticipant: true,
      rejectReason: true,
      package: {
        select: {
          name: true,
          price: true,
          description: true,
          startDate: true,
          dueDate: true,
          packageFile: {
            where: {
              type: ImageType.COVER,
            },
          },
          community: {
            select: {
              name: true,
              location: true,
            },
          },
        },
      },
    },
    skip,
    take: limit,
  });
  const totalCount = await prisma.bookingHistory.count({
    where: whereCondition,
  });
  const totalPages = Math.ceil(totalCount / limit);
  return {
    data: bookingHistories,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalCount,
      limit,
    },
  };
}
