import type { Request, Response } from "express";
import * as bookingService from "../Services/booking-history-services.js";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";

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
    const detailBooking = await bookingService.getDetailBookingById(bookingId);
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
