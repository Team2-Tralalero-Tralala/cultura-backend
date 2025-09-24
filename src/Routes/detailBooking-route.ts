import { Router } from "express";
import * as bookingController from "../Controllers/detailBooking-controller.js";

/*
 * ฟังก์ชัน : router.get("/:id")
 * คำอธิบาย : กำหนดเส้นทาง (endpoint) สำหรับดึงข้อมูลการจองตาม id
 * Input :
 *   - URL parameter :id (number) → รหัสการจอง
 * Output :
 *   - booking (object) : ข้อมูลการจองที่ตรงกับ id
 *   - error (json) : ส่งกลับ error ถ้า id ไม่ถูกต้อง หรือไม่พบการจอง
 * Error :
 *   - 400 : ถ้า id ไม่ใช่ตัวเลข
 *   - 404 : ถ้าไม่พบข้อมูลการจอง
 *   - 500 : ถ้าเกิดข้อผิดพลาดภายในระบบ
 */ 

const router = Router();
router.get("/:id", bookingController.getBooking);

export default router;
