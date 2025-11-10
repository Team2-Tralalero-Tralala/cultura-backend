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
 * /api/admin/booking/histories:
 *   get:
 *     tags:
 *       - Booking Histories (Admin)
 *     summary: Get bookings (admin)
 *     description: >
 *       ดึงรายการการจองทั้งหมดที่อยู่ภายใต้ความรับผิดชอบของ **admin**  
 *       รองรับการแบ่งหน้า (pagination) ผ่าน query parameter `page` และ `limit`  
 *       ทุก response อยู่ในรูปแบบ `createResponse` / `createErrorResponse`  
 *       ต้องแนบ **Bearer JWT Token** ใน header (`Authorization: Bearer <token>`)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าที่ต้องการดึงข้อมูล
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: Bookings (admin) retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Bookings (admin) retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     bookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 12
 *                           tourist:
 *                             type: object
 *                             properties:
 *                               fname:
 *                                 type: string
 *                                 example: Tourist
 *                               lname:
 *                                 type: string
 *                                 example: One
 *                           package:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: Eco Tour
 *                               price:
 *                                 type: number
 *                                 example: 500
 *                           status:
 *                             type: string
 *                             description: สถานะการจอง (BookingStatus)
 *                             enum: [PENDING, BOOKED, REJECTED, REFUND_PENDING, REFUNDED, REFUND_REJECTED]
 *                             example: BOOKED
 *                           bookingAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-10T14:16:30.000Z"
 *                           transferSlip:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *       400:
 *         description: Bad request (invalid parameter or logic error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Invalid page number
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (role not allowed)
 */

/*
 * path : GET /histories
 * คำอธิบาย : ดึงรายการการจองตามสิทธิ์ของผู้ใช้ (admin/member)
 * สิทธิ์ที่เข้าถึงได้ : Admin, Member
 */
bookingRoutes.get(
  "/admin/booking/histories/all",
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




