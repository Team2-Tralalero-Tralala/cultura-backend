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

/**
 * @swagger
 * /api/admin/bookings/all:
 *   get:
 *     summary: ดึงรายการการจองทั้งหมดของแพ็กเกจในชุมชนที่แอดมินดูแล
 *     description: |
 *       ใช้สำหรับดึงข้อมูลการจอง (BookingHistory) ของแพ็กเกจทั้งหมด  
 *       ภายในชุมชนที่ผู้ดูแล (Admin) รับผิดชอบ โดยรองรับ pagination  
 *       และจะแสดงข้อมูลนักท่องเที่ยว แพ็กเกจ ราคา รวมถึงสถานะการจอง
 *     tags:
 *       - Booking (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: หน้าที่ต้องการดึงข้อมูล (ค่าเริ่มต้น 1)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: จำนวนข้อมูลต่อหน้า (ค่าเริ่มต้น 10)
 *     responses:
 *       200:
 *         description: ดึงรายการการจองทั้งหมดสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bookings (admin) retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 15
 *                       tourist:
 *                         type: object
 *                         properties:
 *                           fname:
 *                             type: string
 *                             example: "ศิริพร"
 *                           lname:
 *                             type: string
 *                             example: "พงษ์เพียร"
 *                       package:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "แพ็กเกจท่องเที่ยววิถีชุมชน"
 *                           price:
 *                             type: number
 *                             example: 1500
 *                       totalPrice:
 *                         type: number
 *                         example: 4500
 *                       status:
 *                         type: string
 *                         enum: [BOOKED, PENDING, REJECTED, REFUNDED]
 *                         example: "BOOKED"
 *                       transferSlip:
 *                         type: string
 *                         example: "uploads/slips/slip_2025-01-12.png"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalCount:
 *                       type: integer
 *                       example: 42
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: ไม่สามารถดึงข้อมูลได้ หรือข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ Admin)
 *       404:
 *         description: ไม่พบชุมชนหรือไม่มีข้อมูลการจองในระบบ
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

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




