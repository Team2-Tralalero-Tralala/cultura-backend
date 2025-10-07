import type { Request, Response } from "express";
import * as bookingService from "../Services/booking/booking-history-services.js";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import type { commonDto, TypedHandlerFromDto } from "~/Libs/Types/TypedHandler.js";
import { BookingHistoryDto } from "~/Services/booking/booking-history-dto.js";
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
    const detailBooking = await Number(req.params.id);
    return createResponse(
      res,
      200,
      "get booking history created successfully",
      detailBooking
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : Schema สำหรับ validate ข้อมูลตอนสร้าง Booking History
 * Input  : body (BookingHistoryDto)
 * Output : commonDto object
 */
export const createBookingHistoryDto = {
    body: BookingHistoryDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Controller สำหรับสร้าง Booking History ใหม่
 * Input  : Request body (BookingHistoryDto)
 * Output : JSON response { status, message, data }
 */
export const createBookingHistory: TypedHandlerFromDto<typeof createBookingHistoryDto> = async (req, res) => {
    try {
        const result = await bookingService.createBooking(req.body);
        return createResponse(res, 200, "Create Booking History Success", result)
    } catch (error: any) {
        return createErrorResponse(res, 404, (error as Error).message)
    }
};