/*
 * คำอธิบาย : Router สำหรับจัดการเส้นทางของ "คำขอคืนเงิน" (Refund Request)
 * ใช้สำหรับฝั่ง Admin ที่ดูแลชุมชน
 *
 * ฟังก์ชันหลักที่รองรับ :
 *   - ดึงรายการคำขอคืนเงิน (GET /admin/refunds)
 *   - อนุมัติคำขอคืนเงิน (PATCH /admin/refunds/:id/approve)
 *   - ปฏิเสธคำขอคืนเงิน (PATCH /admin/refunds/:id/reject)
 *
 * Middleware ที่ใช้ :
 *   - authMiddleware : ตรวจสอบสิทธิ์การเข้าสู่ระบบ
 *   - allowRoles : จำกัดสิทธิ์เฉพาะ admin
 *   - validateDto : ตรวจสอบรูปแบบข้อมูล DTO ก่อนเข้าฟังก์ชัน Controller
 */

import { Router } from "express";
import * as RefundController from "~/Controllers/booking-controller.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import { validateDto } from "~/Libs/validateDto.js";

const refundRoutes = Router();

/*
 * เส้นทาง : GET /admin/refunds
 * คำอธิบาย : ดึงรายการคำขอคืนเงินทั้งหมดของชุมชนที่ admin ดูแล (รองรับ pagination)
 */
refundRoutes.get(
  "/admin/booking/refunds/all",
  validateDto(RefundController.getRefundRequestsByAdminDto),
  authMiddleware,
  allowRoles("admin"),
  RefundController.getRefundRequestsByAdmin
);

/*
 * เส้นทาง : PATCH /admin/refunds/:id/approve
 * คำอธิบาย : อนุมัติคำขอคืนเงิน
 */
refundRoutes.patch(
  "/admin/booking/refunds/:id/approve",
  validateDto(RefundController.approveRefundByAdminDto),
  authMiddleware,
  allowRoles("admin"),
  RefundController.approveRefundByAdmin
);

/*
 * เส้นทาง : PATCH /admin/refunds/:id/reject
 * คำอธิบาย : ปฏิเสธคำขอคืนเงิน
 */
refundRoutes.patch(
  "/admin/booking/refunds/:id/reject",
  validateDto(RefundController.rejectRefundByAdminDto),
  authMiddleware,
  allowRoles("admin"),
  RefundController.rejectRefundByAdmin
);

export default refundRoutes;
