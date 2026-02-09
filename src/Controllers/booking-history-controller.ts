import { IsNumberString, IsOptional, IsString } from "class-validator";
import type { Request, Response } from "express";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import * as BookingHistoryService from "~/Services/booking-history/booking-history-service.js";
import {
  BookingIdParamDto,
  CreateBookingBodyDto,
} from "~/Services/booking/booking-dto.js";
import * as TouristBookingService from "~/Services/booking/booking-service.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import * as bookingService from "../Services/booking-history/booking-history-service.js";
import { getHistoriesByRole } from "../Services/booking-history/booking-history-service.js";
import { GetBookingQuery } from "~/Services/booking-history/booking-history-dto.js";
import { GetBookingMemberQuery } from "~/Services/booking-history/booking-history-dto.js";

/* DTO : GetHistoriesByRoleQueryDto
 * วัตถุประสงค์ :
 *  - ใช้ตรวจสอบ query parameters สำหรับการดึง histories ตาม role
 *
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

/**
 * DTO: getBookingsByAdminDto
 * วัตถุประสงค์ : ใช้สำหรับตรวจสอบข้อมูลนำเข้า เมื่อต้องการดึงรายการจองของชุมชน (สำหรับ Admin)
 * Input :
 * - query : page, limit, search, status (จาก GetBookingQuery)
 * Output :
 * - รายการข้อมูลการจอง
 * - ข้อมูล Metadata สำหรับ Pagination
 */
export const getBookingsByAdminDto = {
  query: GetBookingQuery, 
} satisfies commonDto;

/*
 * คำอธิบาย : ดึงรายการการจองทั้งหมดของแพ็กเกจในชุมชนที่แอดมินดูแล
 * Input :
 * - req.user.id (number) : รหัสผู้ใช้งาน (Admin) ที่ดึงจาก Token
 * - req.query :
 * - page (number) : เลขหน้าที่ต้องการ
 * - limit (number) : จำนวนรายการต่อหน้า
 * - search (string) : คำค้นหา
 * - status (string) : สถานะการจอง (เช่น "all", "PENDING", "CONFIRMED")
 * Output :
 * - Response 200 : สำเร็จ (ส่งคืนข้อมูลรายการจองจาก Service)
 * - Response 400 : ล้มเหลว (เกิด Error จากการตรวจสอบ หรือ Service)
 */
export const getBookingsByAdmin: TypedHandlerFromDto<
  typeof getBookingsByAdminDto
> = async (req, res) => {
  try {
    const adminId = Number(req.user!.id);
    
    const { page, limit, search, status } = req.query;

    const result = await bookingService.getBookingsByAdmin(
      adminId,
      page,
      limit,
      search, 
      status  
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
 * คำอธิบาย : ใช้สำหรับอัปเดตสถานะของรายการการจอง (เฉพาะ Admin)
 * Input :
 *   - req.params.id : รหัสของการจอง (bookingId)
 *   - req.body.status : สถานะใหม่ที่ต้องการอัปเดต
 * Output :
 *   - JSON response พร้อมข้อมูลการจองที่ถูกอัปเดต
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
 * DTO : getBookingsByMemberDto
 * วัตถุประสงค์ : สำหรับดึงรายการการจองทั้งหมดของ Member (รองรับ pagination)
 * Input :
 * - query : page, limit, search, status (จาก GetBookingMemberQuery)
 * Output :
 * - รายการข้อมูลการจอง
 * - ข้อมูล Metadata สำหรับ Pagination
 */
export const getBookingsByMemberDto = {
  query: GetBookingMemberQuery, 
} satisfies commonDto;

/*
 * คำอธิบาย : ดึงรายการการจองทั้งหมดของแพ็กเกจที่ Member คนนั้นเป็นผู้ดูแล (overseerMember)
 * Input :
 * - req.user.id (number) : รหัสผู้ใช้งาน (Member) ที่ดึงจาก Token
 * - req.query :
 * - page (number) : เลขหน้าที่ต้องการ
 * - limit (number) : จำนวนรายการต่อหน้า
 * - search (string) : คำค้นหา
 * - status (string) : สถานะการจอง (เช่น "all", "PENDING", "CONFIRMED")
 * Output :
 *   - JSON response พร้อมข้อมูลการจองทั้งหมด (พร้อม pagination)
 */
export const getBookingsByMember: TypedHandlerFromDto<
  typeof getBookingsByMemberDto
> = async (req, res) => {
  try {
    const memberId = Number(req.user!.id);
    
    const { page, limit, search, status } = req.query;

    const result = await bookingService.getBookingsByMember(
      memberId,
      Number(page),
      Number(limit),
      search, 
      status
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
 * คำอธิบาย : ใช้สำหรับอัปเดตสถานะของรายการการจอง (เฉพาะ Member)
 * Input :
 *   - req.user.id    : รหัสของ Member (ใช้เช็คว่าเป็นเจ้าของแพ็กเกจจริงไหม)
 *   - req.params.id  : รหัสของการจอง (bookingId)
 *   - req.body.status : สถานะใหม่ที่ต้องการอัปเดต
 *   - req.body.rejectReason : เหตุผลการปฏิเสธ (ถ้ามี)
 * Output :
 *   - JSON response พร้อมข้อมูลการจองที่ถูกอัปเดต
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
 * DTO : GetHistoryDto
 * วัตถุประสงค์ : สำหรับรับ Query Parameters ของ API ประวัติการจองสมาชิก
 * ใช้สำหรับการแบ่งหน้า (Pagination) และการกรองสถานะการจอง
 * Input :
 *   - query (page, limit, status)
 * Output :
 *   - JSON response พร้อมข้อมูลการจองทั้งหมด (พร้อม pagination)
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
 * DTO : getHistoryDto
 * วัตถุประสงค์ : สำหรับรับ Query Parameters ของ API ประวัติการจองสมาชิก
 * ใช้สำหรับการแบ่งหน้า (Pagination) และการกรองสถานะการจอง
 * Input :
 *   - query (page, limit, status)
 * Output :
 *   - JSON response พร้อมข้อมูลการจองทั้งหมด (พร้อม pagination)
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
 * Input : 
 *   - req.query.status : "ALL" หรือสถานะอื่น ๆ
 * Output : 
 *   - JSON response พร้อมข้อมูลการจองทั้งหมด (พร้อม pagination)
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
 * DTO : TouristIdParamDto
 * วัตถุประสงค์ : สำหรับรับ Parameter ของ API ประวัติการจองของผู้ที่เดินทาง (Tourist)
 * ใช้สำหรับการกรองและแบ่งหน้า (Pagination)
 * Input :
 *   - touristId : รหัสของผู้ที่เดินทาง (Tourist)
 * Output :
 *   - JSON response พร้อมข้อมูลการจองทั้งหมด (พร้อม pagination)
 */
export class TouristIdParamDto {
  @IsNumberString()
  touristId?: string;
}
/**
 * DTO : TouristBookingHistoryQueryDto
 * วัตถุประสงค์ : สำหรับรับ Query Parameters ของ API ประวัติการจองของผู้ที่เดินทาง (Tourist)
 * ใช้สำหรับการกรองและแบ่งหน้า (Pagination)
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
  @IsOptional()
  @IsString()
  endDate?: string;
}
/**
 * DTO สำหรับดึงประวัติการจองของผู้ที่เดินทาง (Tourist)
 * วัตถุประสงค์ : เพื่อให้ผู้ที่เดินทางสามารถดูประวัติการจองของตัวเอง
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
 * คำอธิบาย : Controller สำหรับดึงประวัติการจองของผู้ที่เดินทาง (Tourist)
 * Input :
 *   - req.params.touristId : รหัสผู้ที่เดินทาง (TouristID)
 *   - req.query.page, req.query.limit
 * Output :
 *   - JSON response พร้อมข้อมูลประวัติการจองของผู้ที่เดินทาง
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
      search,
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
      filter,
      search
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
 * DTO : createTouristBookingDto
 * วัตถุประสงค์ : สำหรับสร้าง Booking History
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
 * คำอธิบาย : Handler สำหรับสร้าง Booking History โดย Tourist
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
 * คำอธิบาย : Handler สำหรับอัปโหลดหลักฐานการชำระเงิน
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
