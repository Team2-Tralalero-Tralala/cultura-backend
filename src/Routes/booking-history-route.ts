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
 *     summary: ดึงรายการการจองทั้งหมดของแพ็กเกจในชุมชนที่แอดมินดูแล (เฉพาะสถานะรอดำเนินการ)
 *     description: |
 *       ใช้สำหรับดึงรายการการจอง (BookingHistory) ของแพ็กเกจทั้งหมด
 *       ภายในชุมชนที่ผู้ดูแล (Admin) รับผิดชอบ โดยจะแสดงเฉพาะการจองที่มีสถานะ
 *       **PENDING** หรือ **REFUND_PENDING** เท่านั้น พร้อมข้อมูลนักท่องเที่ยว แพ็กเกจ และราคารวม
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
 *         description: ดึงรายการการจองทั้งหมดสำเร็จ (เฉพาะสถานะ PENDING หรือ REFUND_PENDING)
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
 *                         example: 23
 *                       tourist:
 *                         type: object
 *                         properties:
 *                           fname:
 *                             type: string
 *                             example: "กนกพร"
 *                           lname:
 *                             type: string
 *                             example: "สุขใจ"
 *                       package:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "แพ็กเกจท่องเที่ยวบ้านโนนสะอาด"
 *                           price:
 *                             type: number
 *                             example: 1500
 *                       totalPrice:
 *                         type: number
 *                         example: 3000
 *                       status:
 *                         type: string
 *                         enum: [PENDING, REFUND_PENDING]
 *                         example: "PENDING"
 *                       transferSlip:
 *                         type: string
 *                         example: "uploads/slips/slip_2025-02-11.png"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     totalCount:
 *                       type: integer
 *                       example: 17
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: การดึงข้อมูลล้มเหลวหรือไม่พบชุมชนที่แอดมินดูแล
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ Admin)
 *       404:
 *         description: ไม่พบข้อมูลการจองในสถานะที่ระบุ
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

/**
 * @swagger
 * /api/admin/bookings/{id}/status:
 *   post:
 *     summary: อัปเดตสถานะของรายการการจอง (Admin)
 *     description: |
 *       ใช้สำหรับอัปเดตสถานะของรายการการจองในชุมชน
 *
 *       **อนุญาตให้เปลี่ยนสถานะได้เฉพาะรายการที่อยู่ในสถานะ:**
 *       - `PENDING` (รอตรวจสอบ)
 *       - `REFUND_PENDING` (รอคืนเงิน)
 *
 *       **สถานะที่สามารถเปลี่ยนได้:**
 *       - `BOOKED` — จองสำเร็จ
 *       - `REJECTED` — ปฏิเสธการจอง
 *       - `REFUNDED` — คืนเงินแล้ว
 *       - `REFUND_REJECTED` — ปฏิเสธการคืนเงิน
 *
 *       **กรณีที่ต้องส่ง rejectReason (จำเป็น)**
 *       - เมื่อส่งสถานะ `REJECTED`
 *       - เมื่อส่งสถานะ `REFUND_REJECTED`
 *
 *       ต้องเป็นผู้ใช้ Role: **Admin** และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - Admin / Booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของรายการการจอง
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - BOOKED
 *                   - REJECTED
 *                   - REFUNDED
 *                   - REFUND_REJECTED
 *                 example: REJECTED
 *               rejectReason:
 *                 type: string
 *                 maxLength: 100
 *                 description: เหตุผลการปฏิเสธ (ต้องมีเมื่อสถานะเป็น REJECTED หรือ REFUND_REJECTED)
 *                 example: เอกสารการชำระเงินไม่ถูกต้อง
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: อัปเดตสถานะรายการการจองสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: update booking status successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: REJECTED
 *                     rejectReason:
 *                       type: string
 *                       example: เอกสารการชำระเงินไม่ถูกต้อง
 *       400:
 *         description: คำขอไม่ถูกต้อง เช่น สถานะใหม่ไม่ถูกต้อง หรือห้ามเว้นเหตุผลเมื่อปฏิเสธ
 *       401:
 *         description: ไม่ได้แนบ JWT Token หรือสิทธิ์ไม่ถูกต้อง
 *       404:
 *         description: ไม่พบรายการการจอง
 */

/*
 * path : POST /admin/bookings/:id/status
 * คำอธิบาย : ใช้สำหรับอัปเดตสถานะของรายการการจอง
 * เงื่อนไข :
 *   - สามารถอัปเดตสถานะได้เฉพาะ (PENDING, REFUND_PENDING)
 *   - รองรับการเปลี่ยนเป็น BOOKED, REJECTED, REFUNDED, REFUND_REJECTED
 * สิทธิ์ที่เข้าถึงได้ : Admin
 */

bookingRoutes.post(
  "/admin/bookings/:id/status",
  authMiddleware,
  allowRoles("admin"),
  BookingHistoryController.updateBookingStatus
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
 * path : GET /admin/booking/:id
 * คำอธิบาย : ดึงรายละเอียดการจองตาม Booking ID
 * สิทธิ์ที่เข้าถึงได้ : ทุก role ที่มีสิทธิ์ดูรายละเอียด
 */

bookingRoutes.get(
  "/admin/booking/:id",
  authMiddleware,
  allowRoles("admin", "member", "tourist"),
  BookingHistoryController.getDetailBooking
);

/**
 * @swagger
 * /api/member/booking-history/{bookingId}:
 *   get:
 *     tags:
 *       - BookingHistory (Member)
 *     summary: Get booking detail for the member
 *     description: สมาชิกสามารถดูรายละเอียดประวัติการจองของตนเองได้
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID to fetch
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Booking detail fetched successfully
 *                 data:
 *                   type: object
 *                   description: Booking detail object for the member
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       403:
 *         description: Forbidden - Member role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */

/**
 * Route: GET /member/booking-history/:id
 * คำอธิบาย:
 *   - ใช้สำหรับดึงรายละเอียดการจอง (Booking) ตาม bookingId
 *   - รองรับเฉพาะผู้ใช้งานที่มี role = "member"
 */
bookingRoutes.get(
  "/member/booking-history/:bookingId",
  authMiddleware,
  allowRoles("member"),
  BookingHistoryController.getDetailBookingByMember
);

export default bookingRoutes;
