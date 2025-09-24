import type { Request, Response } from "express";
import * as bookingService from "../Services/detailBooking-service.js";

/*
 * ฟังก์ชัน : getBooking
 * คำอธิบาย : ดึงข้อมูลการจองจาก bookingHistory ด้วย id ที่รับมาจาก request
 * Input :
 *   - req.params.id (number) : รหัสการจอง
 *   - res (Response) : ใช้สำหรับส่งข้อมูลหรือ error กลับไป
 * Output :
 *   - booking (object) : ข้อมูลการจองที่ตรงกับ id
 *   - error (json) : ถ้าเกิดข้อผิดพลาด จะส่ง error กลับไปในรูปแบบ JSON
 * Error :
 *   - ถ้า id ไม่ถูกต้อง (ไม่ใช่ตัวเลข) -> ส่งสถานะ 400 (Bad Request)
 *   - ถ้าไม่พบการจอง -> ส่งสถานะ 404 (Not Found)
 *   - ถ้าเกิดข้อผิดพลาดอื่น ๆ -> ส่งสถานะ 500 (Internal Server Error)
 */

export const getBooking = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const booking = await bookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
