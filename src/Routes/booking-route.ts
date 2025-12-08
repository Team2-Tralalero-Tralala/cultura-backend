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

/**
 * @swagger
 * /api/admin/booking/refunds/all:
 *   get:
 *     summary: ดึงรายการคำขอคืนเงินทั้งหมดของชุมชน (Admin)
 *     description: |
 *       ใช้สำหรับดึงรายการคำขอคืนเงินทั้งหมดของชุมชนที่ Admin ดูแลอยู่  
 *       รองรับการแบ่งหน้า (Pagination) และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - Admin / Refund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: หน้าที่ต้องการดึงข้อมูล
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: สำเร็จ - คืนรายการคำขอคืนเงินทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBase'
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Missing or Invalid Token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */

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

/**
 * @swagger
 * /api/admin/booking/refunds/{id}/approve:
 *   patch:
 *     summary: อนุมัติคำขอคืนเงิน (Admin)
 *     description: |
 *       ใช้สำหรับอนุมัติคำขอคืนเงินที่ได้รับจากนักท่องเที่ยว  
 *       ต้องเป็น **Admin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - Admin / Refund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: รหัสคำขอคืนเงิน
 *     responses:
 *       200:
 *         description: สำเร็จ - อนุมัติคำขอคืนเงินเรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBase'
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Missing or Invalid Token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */

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

/**
 * @swagger
 * /api/admin/booking/refunds/{id}/reject:
 *   patch:
 *     summary: ปฏิเสธคำขอคืนเงิน (Admin)
 *     description: |
 *       ใช้สำหรับปฏิเสธคำขอคืนเงินที่ได้รับจากนักท่องเที่ยว  
 *       ต้องเป็น **Admin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - Admin / Refund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: รหัสคำขอคืนเงิน
 *     responses:
 *       200:
 *         description: สำเร็จ - ปฏิเสธคำขอคืนเงินเรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBase'
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Missing or Invalid Token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */

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

/**
 * @swagger
 * /api/member/booking-history:
 *   get:
 *     summary: ดึงรายการคำขอคืนเงินที่ member ดูแล
 *     description: ดึงรายการคำขอคืนเงินของสมาชิก (รองรับ pagination)
 *     tags:
 *       - Member / Refund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBase'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */
/*
 * เส้นทาง : GET /member/booking-history/refunds
 * คำอธิบาย : ดึงรายการคำขอคืนเงินที่ member ดูแล (รองรับ pagination)
 */
refundRoutes.get(
  "/member/booking-history",
  validateDto(RefundController.getRefundRequestsByMemberDto),
  authMiddleware,
  allowRoles("member"),
  RefundController.getRefundRequestsByMember
);

/**
 * @swagger
 * /api/member/booking-history/{id}/approve-refund:
 *   patch:
 *     summary: อนุมัติคำขอคืนเงิน (Member)
 *     description: Member อนุมัติคำขอคืนเงิน
 *     tags:
 *       - Member / Refund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: อนุมัติสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBase'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */
/*
 * เส้นทาง : PATCH /member/booking-history/:id/approve-refund
 * คำอธิบาย : อนุมัติคำขอคืนเงิน
 */
refundRoutes.patch(
  "/member/booking-history/:id/approve-refund",
  validateDto(RefundController.approveRefundByMemberDto),
  authMiddleware,
  allowRoles("member"),
  RefundController.approveRefundByMember
);

/**
 * @swagger
 * /api/member/booking-history/{id}/reject-refund:
 *   patch:
 *     summary: ปฏิเสธคำขอคืนเงิน (Member)
 *     description: Member ปฏิเสธคำขอคืนเงิน
 *     tags:
 *       - Member / Refund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: ปฏิเสธสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBase'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */
/*
 * เส้นทาง : PATCH /member/booking-history/:id/reject-refund
 * คำอธิบาย : ปฏิเสธคำขอคืนเงิน
 */
refundRoutes.patch(
  "/member/booking-history/:id/reject-refund",
  validateDto(RefundController.rejectRefundByMemberDto),
  authMiddleware,
  allowRoles("member"),
  RefundController.rejectRefundByMember
);
export default refundRoutes;
