import type { Request, Response } from "express";
import * as bookingService from "../Services/bookingHistory/booking-history-service.js";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";

/*
 * ฟังก์ชัน : getDetailBooking
 * คำอธิบาย : สำหรับดึงข้อมูลรายละเอียดการจอง 
 * Input :
 *   - req.params.id : รหัสการจอง (BookingID) ที่ต้องการดูรายละเอียด
 * Output :
 *   - 201 Created : ส่งกลับข้อมูลรายละเอียดการจอง 
 *   - 400 Bad Request : กรณีเกิด error เมื่อไม่พบข้อมูล
 */

export const getDetailBooking = async (req: Request, res: Response) => {
  try {
    const detailBooking = await bookingService.getDetailBooking(req.params.id);
    return createResponse(res, 201, "get booking history created successfully", detailBooking);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);

  }
};



