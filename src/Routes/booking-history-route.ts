// import { Router } from "express";
// import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
// import {
//   getByRole,
//   getDetailBooking,
// } from "../Controllers/booking-history-controller.js";

// const router = Router();

// router.get("/histories", authMiddleware, allowRoles("admin", "member"), getByRole);
// router.get("/:id", getDetailBooking);

// export default router;

import { Router } from "express";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import * as BookingHistoryController from "~/Controllers/booking-history-controller.js";
import { validateDto } from "~/Libs/validateDto.js";

const bookingRoutes = Router();

/*
 * path : GET /admin/bookings/all
 * คำอธิบาย : ใช้สำหรับดึงรายการการจองทั้งหมดของแพ็กเกจในชุมชนที่แอดมินดูแล
 * สิทธิ์ที่เข้าถึงได้ : Admin
 */
bookingRoutes.get(
  "/admin/bookings/all",
  validateDto(BookingHistoryController.getBookingsByAdminDto),
  authMiddleware,
  allowRoles("admin"),
  BookingHistoryController.getBookingsByAdmin
);

/**
 * @swagger
 * /api/booking-histories/histories:
 *   get:
 *     summary: ดึงข้อมูลประวัติการจองตามบทบาทผู้ใช้ (Admin หรือ Member)
 *     description: ใช้สำหรับดึงข้อมูล booking histories ของผู้ใช้ตามบทบาท โดยต้องมี Bearer Token
 *     tags:
 *       - BookingHistories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBookingHistoryList'
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */

/*
 * path : GET /histories
 * คำอธิบาย : ดึงรายการการจองตามสิทธิ์ของผู้ใช้ (admin/member)
 * สิทธิ์ที่เข้าถึงได้ : Admin, Member
 */
bookingRoutes.get(
  "/histories",
  authMiddleware,
  allowRoles("admin", "member"),
  BookingHistoryController.getByRole
);
/**
 * @swagger
 * /api/booking-histories/{id}:
 *   get:
 *     summary: ดึงรายละเอียดการจอง (Booking Detail)
 *     description: ใช้เพื่อดึงข้อมูลรายละเอียดของการจองโดยระบุรหัสการจอง (Booking ID) โดยผู้ใช้ที่มีสิทธิ์เข้าถึง (admin, member, tourist)
 *     tags:
 *       - BookingHistories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสการจอง (Booking ID)
 *         example: 1
 *     responses:
 *       200:
 *         description: ดึงรายละเอียดการจองสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBookingDetail'
 *       400:
 *         description: รหัสการจองไม่ถูกต้อง (Incorrect ID)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       404:
 *         description: ไม่พบข้อมูลการจอง (Booking not found)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */

/*
 * path : GET /:id
 * คำอธิบาย : ดึงรายละเอียดการจองตาม Booking ID
 * สิทธิ์ที่เข้าถึงได้ : ทุก role ที่มีสิทธิ์ดูรายละเอียด
 */

bookingRoutes.get(
  "/:id",
  authMiddleware,
  allowRoles("admin", "member", "tourist"),
  BookingHistoryController.getDetailBooking
);

export default bookingRoutes;




