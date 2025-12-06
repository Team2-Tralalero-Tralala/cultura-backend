import type { Request, Response } from "express";
import { IsNumberString } from "class-validator";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import { getHistoriesByRole } from "../Services/booking-history-service.js";
import * as bookingService from "../Services/booking-history-service.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import * as BookingHistoryService from "~/Services/booking-history-service.js";
/*
 * ฟังก์ชัน : getByRole
 * คำอธิบาย : Handler สำหรับดึงประวัติการจองตามสิทธิ์ของผู้ใช้งาน
 * Input :
 *   - req.user : ข้อมูลผู้ใช้ (ได้มาจาก middleware authentication)
 *   - res : Response object ของ Express สำหรับส่งผลลัพธ์กลับไปยัง client
 * Output :
 *   - 200 OK พร้อมข้อมูล booking histories
 *   - 400 Bad Request ถ้ามีข้อผิดพลาดหรือไม่สามารถดึงข้อมูลได้
 */
export const getByRole = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { page = 1, limit = 10 } = req.query;
    const data = await getHistoriesByRole(req.user, Number(page), Number(limit));
    return createResponse(res, 200, "Get booking histories by role successfully", data);
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
export const updateBookingStatus: TypedHandlerFromDto<any> = async (req, res) => {
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

/**
 * DTO : BookingIdParamDto
 * คำอธิบาย :
 *  - ใช้สำหรับตรวจสอบพารามิเตอร์ bookingId ที่ส่งมาผ่าน URL
 *  - ต้องเป็นค่า Number ในรูปแบบ string เท่านั้น
 */
export class BookingIdParamDto {
  @IsNumberString()
  bookingId?: number;
}

/**
 * DTO สำหรับ "ดึงข้อมูลรายละเอียดการจองตามรหัส"
 * ใช้ validate params ก่อนเข้า controller
 */
export const getDetailBookingByMemberDto = {
  params: BookingIdParamDto,
} satisfies commonDto;


/**
 * ฟังก์ชัน : getDetailBookingByMember
 * คำอธิบาย :
 *  - สำหรับดึงรายละเอียดการจองเฉพาะของสมาชิก (role = member)
 *  - สมาชิกจะเห็นเฉพาะ booking ที่ตนเองเป็นผู้จองหรืออยู่ในชุมชนที่เกี่ยวข้อง
 *
 * Input :
 *  - req.user.id          : รหัสผู้ใช้ (มาจาก authMiddleware)
 *  - req.params.bookingId : รหัสการจองที่ต้องการดูรายละเอียด (ผ่าน DTO ตรวจสอบเลขแล้ว)
 *
 * Output :
 *  - 200 OK : ส่งกลับรายละเอียดการจองแบบเต็ม
 *  - 400 Bad Request : หาก bookingId ไม่ถูกต้อง หรือเกิด error อื่น ๆ
 *
 * สิทธิ์ในการเข้าถึง :
 *  - เฉพาะผู้ใช้ role "member" ที่เกี่ยวข้องกับ booking เท่านั้น
 */
export const getDetailBookingByMember: TypedHandlerFromDto<
  typeof getDetailBookingByMemberDto
> = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const userId = Number(req.user!.id);
    const result = await bookingService.getDetailBookingByMember(
      bookingId,
      userId
    );
    return createResponse(res, 200, "Get booking detail successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

