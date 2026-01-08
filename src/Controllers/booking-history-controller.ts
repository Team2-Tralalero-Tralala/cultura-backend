import { IsNumberString, IsOptional, IsString } from "class-validator";
import type { Request, Response } from "express";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import * as BookingHistoryService from "~/Services/booking-history-service.js";
import {
  BookingIdParamDto,
  CreateBookingBodyDto,
} from "~/Services/booking/booking-dto.js";
import * as TouristBookingService from "~/Services/booking/booking-service.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import * as bookingService from "../Services/booking-history-service.js";
import { getHistoriesByRole } from "../Services/booking-history-service.js";
/*
 * ฟังก์ชัน : getByRole
 * คำอธิบาย : Handler สำหรับดึงประวัติการจองตามสิทธิ์ของผู้ใช้งาน
 * Input :
 *  - query :
 *    - page  : หมายเลขหน้าของข้อมูล (optional, ต้องเป็นตัวเลขในรูปแบบ string)
 *    - limit : จำนวนข้อมูลต่อหน้า (optional, ต้องเป็นตัวเลขในรูปแบบ string)
 *
 * Output :
 *  - หากข้อมูลถูกต้อง จะผ่านการ validate และใช้งานต่อได้
 *  - หากข้อมูลไม่ถูกต้อง จะถูก reject พร้อม validation error
 */
export class GetHistoriesByRoleQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}

/* DTO : getByRoleDto
 * วัตถุประสงค์ :
 *  - ใช้ตรวจสอบ query สำหรับการดึง booking histories ตาม role
 *
 * Input :
 *  - query : GetHistoriesByRoleQueryDto (page, limit)
 *
 * Output :
 *  - หากข้อมูลถูกต้อง จะอนุญาตให้ดำเนินการต่อ
 *  - หากไม่ถูกต้อง จะส่งข้อผิดพลาดกลับ
 */
export const getByRoleDto = {
  query: GetHistoriesByRoleQueryDto,
} satisfies commonDto;

/**
 * คำอธิบาย : ดึงประวัติการจอง (Booking History) ตาม role ของผู้ใช้งาน
 * Input :
 *  - req.user : UserPayload (ผ่าน auth middleware แล้ว)
 *  - page : number (default = 1)
 *  - limit : number (default = 10)
 * Output : รายการ booking histories ตามสิทธิ์ของผู้ใช้งาน
 */
export const getByRole: TypedHandlerFromDto<typeof getByRoleDto> = async (
  req,
  res
) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const data = await getHistoriesByRole(
      req.user!,
      Number(page),
      Number(limit)
    );
    return createResponse(
      res,
      200,
      "Get booking histories by role successfully",
      data
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : getDetailBooking
 * คำอธิบาย : สำหรับดึงข้อมูลรายละเอียดการจอง
 * Input :
 *   - req.params.id : รหัสการจอง (BookingID) ที่ต้องการดูรายละเอียด
 * Output :
 *   - 200 Created : ส่งกลับข้อมูลรายละเอียดการจอง
 *   - 400 Bad Request : กรณีเกิด error เมื่อไม่พบข้อมูล
 */

export const getDetailBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);

    // ฟังก์ชัน getDetailBookingById จาก bookingService เพื่อดึงข้อมูลการจอง
    const detailBooking = await bookingService.getDetailBooking(bookingId);
    return createResponse(
      res,
      200,
      "Get booking detail successfully",
      detailBooking
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : DTO สำหรับดึงรายการการจองทั้งหมดของแอดมิน (รองรับ pagination)
 * Input :
 *   - query (page, limit)
 * Output :
 *   - รายการการจองทั้งหมดของแพ็กเกจในชุมชน + pagination metadata
 */
export const getBookingsByAdminDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getBookingsByAdmin
 * คำอธิบาย : ดึงรายการการจองทั้งหมดของแพ็กเกจในชุมชนที่แอดมินดูแล
 * Route : GET /admin/bookings/all
 * Input :
 *   - req.user.id (จาก middleware auth)
 *   - req.query.page, req.query.limit
 * Output :
 *   - JSON response พร้อมข้อมูลการจองทั้งหมด (พร้อม pagination)
 * หมายเหตุ :
 *   - ใช้ข้อมูล adminId จาก token (req.user)
 *   - เฉพาะผู้ใช้ role "admin" เท่านั้นที่เข้าถึงได้
 */
export const getBookingsByAdmin: TypedHandlerFromDto<
  typeof getBookingsByAdminDto
> = async (req, res) => {
  try {
    const adminId = Number(req.user!.id);
    const { page = 1, limit = 10 } = req.query;

    const result = await bookingService.getBookingsByAdmin(
      adminId,
      Number(page),
      Number(limit)
    );

    return createResponse(
      res,
      200,
      "Bookings (admin) retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : updateBookingStatusController
 * คำอธิบาย : ใช้สำหรับอัปเดตสถานะของรายการการจอง (เฉพาะ Admin)
 * Route : PATCH /admin/bookings/:id/status
 * Input :
 *   - req.params.id : รหัสของการจอง (bookingId)
 *   - req.body.status : สถานะใหม่ที่ต้องการอัปเดต
 * Output :
 *   - JSON response พร้อมข้อมูลการจองที่ถูกอัปเดต
 * หมายเหตุ :
 *   - รองรับเฉพาะสถานะต่อไปนี้:
 *       • BOOKED (จองสำเร็จ)
 *       • REJECTED (ปฏิเสธจอง)
 *       • REFUNDED (คืนเงินแล้ว)
 *       • REFUND_REJECTED (ปฏิเสธการคืนเงิน)
 *   - เฉพาะผู้ใช้ role "admin" เท่านั้นที่เข้าถึงได้
 */
export const updateBookingStatus: TypedHandlerFromDto<any> = async (
  req,
  res
) => {
  try {
    const bookingId = Number(req.params.id);
    const { status, rejectReason } = req.body as {
      status?: string;
      rejectReason?: string;
    };

    if (!bookingId || !status) {
      return createErrorResponse(res, 400, "Missing booking ID or status");
    }

    const isRejectStatus =
      status === "REJECTED" || status === "REFUND_REJECTED";

    // ถ้าเป็นสถานะปฏิเสธ → บังคับต้องมีเหตุผล และห้ามเป็น string ว่าง
    if (isRejectStatus) {
      if (!rejectReason || String(rejectReason).trim() === "") {
        return createErrorResponse(res, 400, "กรุณากรอกเหตุผลการปฏิเสธ");
      }
    }

    const updated = await BookingHistoryService.updateBookingStatus(
      bookingId,
      status,
      rejectReason
    );

    return createResponse(
      res,
      200,
      "update booking status successfully",
      updated
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : DTO สำหรับดึงรายการการจองทั้งหมดของ Member (รองรับ pagination)
 * Input :
 *   - query (page, limit)
 * Output :
 *   - รายการการจองทั้งหมดของแพ็กเกจที่ Member คนนั้นดูแล + pagination metadata
 */
export const getBookingsByMemberDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getBookingsByMember
 * คำอธิบาย : ดึงรายการการจองทั้งหมดของแพ็กเกจที่ Member คนนั้นเป็นผู้ดูแล (overseerMember)
 * Route : GET /member/bookings/all
 * Input :
 *   - req.user.id
 *   - req.query.page, req.query.limit, req.query.status (ไม่บังคับ)
 * Output :
 *   - JSON response พร้อมข้อมูลการจองทั้งหมด (พร้อม pagination)
 * หมายเหตุ :
 *   - ใช้ข้อมูล memberId จาก token (req.user)
 *   - เฉพาะผู้ใช้ role "member" เท่านั้นที่เข้าถึงได้
 */
export const getBookingsByMember: TypedHandlerFromDto<
  typeof getBookingsByMemberDto
> = async (req, res) => {
  try {
    const memberId = Number(req.user!.id);
    // const { page = 1, limit = 10, status } = req.query as any;
    const {
      page = 1,
      limit = 10,
      status,
    } = req.query as {
      page?: number;
      limit?: number;
      status?: string;
    };
    const result = await bookingService.getBookingsByMember(
      memberId,
      Number(page),
      Number(limit),
      status as string | undefined
    );

    return createResponse(
      res,
      200,
      "Bookings (member) retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : updateBookingStatusByMember
 * คำอธิบาย : ใช้สำหรับอัปเดตสถานะของรายการการจอง (เฉพาะ Member)
 * Route : POST /member/bookings/:id/status
 * Input :
 *   - req.user.id    : รหัสของ Member (ใช้เช็คว่าเป็นเจ้าของแพ็กเกจจริงไหม)
 *   - req.params.id  : รหัสของการจอง (bookingId)
 *   - req.body.status : สถานะใหม่ที่ต้องการอัปเดต
 *   - req.body.rejectReason : เหตุผลการปฏิเสธ (ถ้ามี)
 * Output :
 *   - JSON response พร้อมข้อมูลการจองที่ถูกอัปเดต
 * หมายเหตุ :
 *   - รองรับเฉพาะสถานะต่อไปนี้:
 *       • BOOKED (จองสำเร็จ)
 *       • REJECTED (ปฏิเสธจอง)
 *       • REFUNDED (คืนเงินแล้ว)
 *       • REFUND_REJECTED (ปฏิเสธการคืนเงิน)
 *   - เฉพาะผู้ใช้ role "member" และต้องเป็นผู้ดูแลแพ็กเกจ (overseerMember) ของ booking นั้นเท่านั้น
 */
export const updateBookingStatusByMember: TypedHandlerFromDto<any> = async (
  req,
  res
) => {
  try {
    const memberId = Number(req.user!.id);
    const bookingId = Number(req.params.id);

    const { status, rejectReason } = req.body as {
      status?: string;
      rejectReason?: string;
    };

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return createErrorResponse(res, 400, "Invalid booking ID");
    }

    if (!status) {
      return createErrorResponse(res, 400, "Missing booking status");
    }

    const isRejectStatus =
      status === "REJECTED" || status === "REFUND_REJECTED";

    // ถ้าเป็นสถานะปฏิเสธ → บังคับต้องมีเหตุผล และห้ามเป็น string ว่าง
    if (isRejectStatus) {
      if (!rejectReason || String(rejectReason).trim() === "") {
        return createErrorResponse(res, 400, "กรุณากรอกเหตุผลการปฏิเสธ");
      }
    }

    const updated = await BookingHistoryService.updateBookingStatusByMember(
      memberId,
      bookingId,
      status,
      rejectReason
    );

    return createResponse(
      res,
      200,
      "update booking status (member) successfully",
      updated
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/**
 * คำอธิบาย : ดึงรายละเอียดการจองโดยใช้ getDetailBookingById (ไม่ล็อคสถานะ PENDING)
 * Input: req.params.id - รหัสการจอง (bookingId) ที่ต้องการดึงข้อมูล
 * Output:
 * - 200 OK พร้อมข้อมูลรายละเอียดการจอง (detail)
 * - 400 Bad Request หากเกิดข้อผิดพลาด
 */
export const getBookingDetailForTourist = async (
  req: Request,
  res: Response
) => {
  try {
    const bookingId = Number(req.params.id);
    const detail = await BookingHistoryService.getDetailBookingById(bookingId);

    return createResponse(res, 200, "Get booking detail successfully", detail);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * คำอธิบาย : DTO สำหรับรับ Query Parameters ของ API ประวัติการจองสมาชิก
 * ใช้สำหรับการแบ่งหน้า (Pagination) และการกรองสถานะการจอง
 */
export class GetHistoryDto {
  /**
   * หมายเลขหน้าที่ต้องการดึงข้อมูล
   */
  @IsOptional()
  page?: any;

  /**
   * จำนวนรายการต่อหน้า
   */
  @IsOptional()
  limit?: any;

  /**
   * สถานะการจอง
   * ยอมรับเป็น String ใด ๆ (รวมถึง "ALL")
   */
  @IsString()
  @IsOptional()
  status?: string; // ยอมรับ String อะไรก็ได้ (รวมถึง "ALL")
}

/**
 * คำอธิบาย : กำหนด Schema ของ Query สำหรับ Endpoint นี้
 */
export const getHistoryDto = {
  query: GetHistoryDto,
} satisfies commonDto;

/**
 * คำอธิบาย : Controller สำหรับดึงประวัติการจองของสมาชิก
 * รองรับการแบ่งหน้า และการดึงข้อมูลทุกสถานะ (ALL)
 * Input  : req (ต้องผ่าน Auth เพื่อให้ได้ memberId)
 * Output : Response ข้อมูลประวัติการจอง
 */
export const getMemberBookingHistoriesNew: TypedHandlerFromDto<any> = async (
  req,
  res
) => {
  try {
    // ดึง memberId จากข้อมูลผู้ใช้งานที่ผ่านการยืนยันตัวตน
    const memberId = Number(req.user!.id);

    // รับค่า Query Parameters พร้อมกำหนดค่า Default
    const { page = 1, limit = 10, status } = req.query as any;

    // เรียก Service เพื่อดึงข้อมูลประวัติการจอง
    const result = await bookingService.getMemberBookingHistories(
      memberId,
      Number(page),
      Number(limit),
      status
    );

    // ส่ง Response กลับเมื่อดึงข้อมูลสำเร็จ
    return createResponse(res, 200, "Get history success", result);
  } catch (error) {
    // ส่ง Error Response เมื่อเกิดข้อผิดพลาด
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/**
 * คำอธิบาย : Dispatcher สำหรับเลือกเส้นทางการทำงานของ API
 * - ถ้า status = "ALL" → ใช้ Logic ใหม่
 * - ถ้า status อื่น     → ใช้ Logic เดิม
 */
export const getBookingHistoriesDispatcher: TypedHandlerFromDto<any> = async (
  req,
  res,
  next
) => {
  // ถ้าเจอ ALL -> ไปทางใหม่
  if (req.query.status === "ALL") {
    return getMemberBookingHistoriesNew(req, res, next);
  }

  // ถ้าไม่เจอ -> ไปทางเดิม
  return getBookingsByMember(req, res, next);
};
/**
 * DTO สำหรับรับ Parameter ของ API ประวัติการจองของผู้ที่เดินทาง (Tourist)
 * ใช้สำหรับการกรองและแบ่งหน้า (Pagination)
 */
export class TouristIdParamDto {
  @IsNumberString()
  touristId?: string;
}
/**
 * DTO สำหรับรับ Query Parameters ของ API ประวัติการจองของผู้ที่เดินทาง (Tourist)
 * ใช้สำหรับการกรองและแบ่งหน้า (Pagination)
 * วัตถุประสงค์ : เพื่อให้ผู้ที่เดินทางสามารถดูประวัติการจองของตัวเอง
 * คำอธิบาย : DTO สำหรับรับ Query Parameters ของ API ประวัติการจองของผู้ที่เดินทาง (Tourist)
 * input :
 *   - req.query.sort : ลำดับการเรียงข้อมูล (asc/desc)
 *   - req.query.status : สถานะการจอง
 *   - req.query.startDate : วันที่เริ่มต้น
 *   - req.query.endDate : วันที่สิ้นสุด
 * output :
 *   - JSON response พร้อมข้อมูลประวัติการจองของผู้ที่เดินทาง
 */
export class TouristBookingHistoryQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  sort?: "asc" | "desc";

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
/**
 * DTO สำหรับดึงประวัติการจองของผู้ที่เดินทาง (Tourist)
 * วัตถุประสงค์ : เพื่อให้ผู้ที่เดินทางสามารถดูประวัติการจองของตัวเอง
 * คำอธิบาย : DTO สำหรับดึงประวัติการจองของผู้ที่เดินทาง (Tourist)
 * Input :
 *   - req.params.touristId : รหัสผู้ที่เดินทาง (TouristID)
 *   - req.query.page, req.query.limit
 * Output :
 *   - JSON response พร้อมข้อมูลประวัติการจองของผู้ที่เดินทาง
 */
export const getTouristBookingHistoriesDto = {
  params: TouristIdParamDto,
  query: TouristBookingHistoryQueryDto,
} satisfies commonDto;
/*
 * ฟังก์ชัน Controller สำหรับ "ดึงข้อมูลชุมชนตามรหัส"
 * input: communityId, page, limit
 * output: account in community
 */
export const getTouristBookingHistories: TypedHandlerFromDto<
  typeof getTouristBookingHistoriesDto
> = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort,
      status,
      startDate,
      endDate,
    } = req.query as any;
    const filter: {
      status?: string[];
      date?: { from: Date; to: Date };
    } = {};

    if (status) {
      filter.status = status
        .split(",")
        .map((status: string) => status.trim())
        .map((status: string) =>
          status === "REFUNDED_PENDING" ? "REFUND_PENDING" : status
        );
    }

    if (startDate && endDate) {
      filter.date = {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    }
    const result = await bookingService.getTouristBookingHistory(
      Number(req.user?.id),
      Number(page),
      Number(limit),
      sort || "desc",
      filter
    );
    return createResponse(
      res,
      200,
      "get booking histories successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : DTO สำหรับสร้าง Booking History
 * Input :
 *   - params.bookingId - รหัสการจอง (ใช้เป็น reference, อาจจะไม่ใช้ในการสร้างจริง)
 *   - body.packageId - รหัสแพ็กเกจที่ต้องการจอง
 *   - body.totalParticipant - จำนวนผู้เข้าร่วม
 *   - body.transferSlip - หลักฐานการโอนเงิน (optional)
 *   - body.touristBankId - รหัสบัญชีธนาคารของนักท่องเที่ยว (optional)
 * Output : ข้อมูล Booking History ที่สร้างใหม่
 */
export const createTouristBookingDto = {
  params: BookingIdParamDto,
  body: CreateBookingBodyDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : createTouristBooking
 * คำอธิบาย : Handler สำหรับสร้าง Booking History โดย Tourist
 * รองรับ:
 *   - สร้างการจองใหม่โดยระบุแพ็กเกจและจำนวนผู้เข้าร่วม
 *   - อัปโหลดหลักฐานการโอนเงิน (optional)
 *   - ระบุบัญชีธนาคาร (optional)
 * Input :
 *   - req.params.bookingId - รหัสการจอง (reference)
 *   - req.body.packageId - รหัสแพ็กเกจ
 *   - req.body.totalParticipant - จำนวนผู้เข้าร่วม
 *   - req.body.transferSlip - หลักฐานการโอนเงิน (optional)
 *   - req.body.touristBankId - รหัสบัญชีธนาคาร (optional)
 *   - req.user.id - รหัสผู้ใช้ (Tourist) จาก authentication middleware
 * Output :
 *   - 201 Created พร้อมข้อมูล Booking History ที่สร้างใหม่
 *   - 400 Bad Request ถ้ามี error
 */
export const createTouristBooking: TypedHandlerFromDto<
  typeof createTouristBookingDto
> = async (req, res) => {
  try {
    const touristId = Number(req.user?.id);
    const { packageId, totalParticipant, transferSlip, touristBankId } =
      req.body;

    if (!touristId) {
      return createErrorResponse(res, 401, "ไม่พบข้อมูลผู้ใช้");
    }

    const booking = await TouristBookingService.createTouristBooking(
      touristId,
      packageId,
      totalParticipant,
      transferSlip,
      touristBankId
    );

    return createResponse(res, 201, "สร้างข้อมูลการจองสำเร็จ", booking);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : uploadPaymentProof
 * คำอธิบาย : Handler สำหรับอัปโหลดหลักฐานการชำระเงิน
 * รองรับ:
 *   - อัปโหลดไฟล์หลักฐานการชำระเงิน (รูปภาพ: jpg, jpeg, png หรือ PDF)
 *   - ไฟล์จะถูกบันทึกในโฟลเดอร์ uploads/
 *   - ไฟล์รูปภาพจะถูกบีบอัดอัตโนมัติ
 * Input :
 *   - req.file - ไฟล์ที่อัปโหลด (จาก multer middleware)
 *   - req.user.id - รหัสผู้ใช้ (Tourist) จาก authentication middleware
 * Output :
 *   - 200 OK พร้อมข้อมูล path ของไฟล์ที่อัปโหลด
 *   - 400 Bad Request ถ้าไม่พบไฟล์
 */
export const uploadPaymentProof = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return createErrorResponse(
        res,
        400,
        "ไม่พบไฟล์หลักฐานการชำระเงิน กรุณาแนบไฟล์"
      );
    }

    const filePath = req.file.path.replace(/\\/g, "/"); // แปลง backslash เป็น forward slash
    const fileName = req.file.filename;

    return createResponse(res, 200, "อัปโหลดหลักฐานการชำระเงินสำเร็จ", {
      filePath,
      fileName,
    });
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
