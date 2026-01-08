import { Router } from "express";
import * as BookingHistoryController from "~/Controllers/booking-history-controller.js";
import { upload } from "~/Libs/uploadFile.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import { compressUploadedFile } from "~/Middlewares/upload-middleware.js";

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
  validateDto(BookingHistoryController.getByRoleDto),
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
 * /api/member/booking-histories:
 *   get:
 *     summary: ดึงประวัติการจองของตนเอง (Member)
 *     description: |
 *       ใช้สำหรับดึงรายการประวัติการจอง (BookingHistory)
 *       **เฉพาะของผู้ใช้ Member ที่ล็อกอินอยู่**
 *       พร้อมข้อมูลแพ็กเกจ ชุมชน ราคารวม และสถานะการจอง
 *       รองรับการแบ่งหน้า (Pagination)
 *
 *     tags:
 *       - Booking (Member)
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: หน้าที่ต้องการดึงข้อมูล (ค่าเริ่มต้น 1)
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: จำนวนข้อมูลต่อหน้า (ค่าเริ่มต้น 10)
 *
 *     responses:
 *       200:
 *         description: ดึงประวัติการจองของสมาชิกสำเร็จ
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
 *                   example: Booking histories retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       community:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "ชุมชนบ้านโนนสะอาด"
 *                       package:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "แพ็กเกจท่องเที่ยวเชิงวัฒนธรรม"
 *                           price:
 *                             type: number
 *                             example: 1500
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       totalPrice:
 *                         type: number
 *                         example: 3000
 *                       status:
 *                         type: string
 *                         example: "BOOKED"
 *                         enum:
 *                           - PENDING
 *                           - BOOKED
 *                           - REJECTED
 *                           - REFUND_PENDING
 *                           - REFUNDED
 *                           - REFUND_REJECTED
 *                       transferSlip:
 *                         type: string
 *                         nullable: true
 *                         example: "uploads/slips/slip_2025-02-11.png"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-11T10:12:45.000Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalCount:
 *                       type: integer
 *                       example: 21
 *                     limit:
 *                       type: integer
 *                       example: 10
 *
 *       400:
 *         description: การดึงข้อมูลล้มเหลวหรือ query ไม่ถูกต้อง
 *
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ Member)
 *
 *       404:
 *         description: ไม่พบประวัติการจอง
 *
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

/*
 * path : GET /member/booking-histories
 * คำอธิบาย : ใช้สำหรับดึงรายการการจองทั้งหมดของแพ็กเกจในชุมชนที่สมาชิก
 * สิทธิ์ที่เข้าถึงได้ : member
 */
bookingRoutes.get(
  "/member/booking-histories",
  validateDto(BookingHistoryController.getHistoryDto),
  authMiddleware,
  allowRoles("member"),
  BookingHistoryController.getBookingHistoriesDispatcher
);

/**
 * @swagger
 * /api/member/booking/{id}/status:
 *   post:
 *     summary: อัปเดตสถานะของรายการการจอง (Member)
 *     description: |
 *       ใช้สำหรับอัปเดตสถานะของรายการการจองที่เป็นของผู้ใช้ Member เองเท่านั้น
 *
 *       **ตัวอย่างการใช้งานทั่วไปของ Member เช่น**
 *       - ขอคืนเงินจากการจองที่ชำระเงินแล้ว
 *       - ยกเลิกการจอง (ตามเงื่อนไขที่ระบบกำหนด)
 *
 *       **สถานะที่สมาชิกสามารถส่งได้ (ตัวอย่าง):**
 *       - `CANCELLED` — ยกเลิกการจอง
 *       - `REFUND_PENDING` — ขอคืนเงิน รอการตรวจสอบจากแอดมิน
 *
 *       ต้องเป็นผู้ใช้ Role: **Member** และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - Member / Booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของรายการการจอง (BookingHistory ID)
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
 *                   - CANCELLED
 *                   - REFUND_PENDING
 *                 example: REFUND_PENDING
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: อัปเดตสถานะรายการการจองสำเร็จ (Member)
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
 *                   example: update booking status by member successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 15
 *                     status:
 *                       type: string
 *                       example: REFUND_PENDING
 *       400:
 *         description: คำขอไม่ถูกต้อง เช่น สถานะใหม่ไม่ถูกต้อง หรือไม่สามารถอัปเดตสถานะได้
 *       401:
 *         description: ไม่ได้แนบ JWT Token หรือสิทธิ์ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ Member)
 *       404:
 *         description: ไม่พบรายการการจอง
 */

/*
 * path : POST /member/bookings/:id/status
 * คำอธิบาย : ใช้สำหรับอัปเดตสถานะของรายการการจอง
 * เงื่อนไข :
 *   - สามารถอัปเดตสถานะได้เฉพาะ (PENDING, REFUND_PENDING)
 *   - รองรับการเปลี่ยนเป็น BOOKED, REJECTED, REFUNDED, REFUND_REJECTED
 * สิทธิ์ที่เข้าถึงได้ : member
 */
bookingRoutes.post(
  "/member/booking/:id/status",
  authMiddleware,
  allowRoles("member"),
  BookingHistoryController.updateBookingStatusByMember
);
/*
 *                   example: Booking histories (tourist) retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 12
 *                           community:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: "ชุมชนบ้านโนนสะอาด"
 *                           package:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 5
 *                               name:
 *                                 type: string
 *                                 example: "แพ็กเกจท่องเที่ยวเชิงวัฒนธรรม"
 *                               description:
 *                                 type: string
 *                                 example: "รายละเอียดแพ็กเกจ..."
 *                               price:
 *                                 type: number
 *                                 example: 1500
 *                               startDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-03-01T00:00:00.000Z"
 *                               dueDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-02-28T00:00:00.000Z"
 *                               status:
 *                                 type: string
 *                                 example: "PUBLISH"
 *                               location:
 *                                 type: string
 *                                 example: "ต.โนนสะอาด อ.เมือง จ.ขอนแก่น"
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                           totalPrice:
 *                             type: number
 *                             example: 3000
 *                           status:
 *                             type: string
 *                             example: "BOOKED"
 *                           transferSlip:
 *                             type: string
 *                             nullable: true
 *                             example: "uploads/slips/slip_2025-02-11.png"
 *                           bookingAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-02-11T10:12:45.000Z"
 *                           isTripCompleted:
 *                             type: boolean
 *                             example: false
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         totalCount:
 *                           type: integer
 *                           example: 21
 *                         limit:
 *                           type: integer
 *                           example: 10
 *       400:
 *         description: การดึงข้อมูลล้มเหลว
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ
 */
bookingRoutes.get(
  "/tourist/booking-histories",
  authMiddleware,
  allowRoles("tourist"),
  BookingHistoryController.getTouristBookingHistories
);
/**
 * @swagger
 * /api/tourist/booking-history/own:
 *   get:
 *     summary: ดึงประวัติการจองของผู้ที่เดินทาง (Tourist)
 *     description: |
 *       ใช้สำหรับดึงประวัติการจองของผู้ที่เดินทาง (Tourist)
 *     tags:
 *       - Tourist / Booking History
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงประวัติการจองของผู้ที่เดินทาง (Tourist) สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: get booking histories successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 351
 *                           bookingAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-12-22T06:49:56.000Z"
 *                           status:
 *                             type: string
 *                             example: "REJECTED"
 *                           totalParticipant:
 *                             type: integer
 *                             example: 2
 *                           rejectReason:
 *                             type: string
 *                             nullable: true
 *                             example: "สลิปไม่ถูกต้อง"
 *                           package:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "ปลูกป่าชายเลน"
 *                               price:
 *                                 type: number
 *                                 example: 1435
 *                               description:
 *                                 type: string
 *                                 example: "สัมผัสวิถีชีวิต ดำนา เกี่ยวข้าว ทานอาหารพื้นถิ่น"
 *                               startDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-12-22T07:03:04.000Z"
 *                               dueDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2026-12-22T07:03:04.000Z"
 *                               packageFile:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 106
 *                                     filePath:
 *                                       type: string
 *                                       example: "uploads/store1.jpg"
 *                                     type:
 *                                       type: string
 *                                       example: "COVER"
 *                               community:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                     example: "วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านทับทิมสยาม"
 *                                   location:
 *                                     type: object
 *                                     properties:
 *                                       id:
 *                                         type: integer
 *                                         example: 12
 *                                       houseNumber:
 *                                         type: string
 *                                         example: "849/14"
 *                                       subDistrict:
 *                                         type: string
 *                                         example: "อ่างทอง"
 *                                       district:
 *                                         type: string
 *                                         example: "เกาะสมุย"
 *                                       province:
 *                                         type: string
 *                                         example: "สุราษฎร์ธานี"
 *                                       postalCode:
 *                                         type: string
 *                                         example: "84140"
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *       401:
 *         description: Missing Token
 *       403:
 *         description: Forbidden
 *       404:
 *         description: ไม่พบประวัติการจอง
 */
/**
 * คำอธิบาย: ใช้สำหรับดึงประวัติการจองของผู้ที่เดินทาง (Tourist)
 */
bookingRoutes.get(
  "/tourist/booking-history/own",
  authMiddleware,
  allowRoles("tourist"),
  BookingHistoryController.getTouristBookingHistories
);

/**
 * @swagger
 * /api/tourist/booking/{bookingId}:
 *   post:
 *     summary: สร้างข้อมูลการจอง (Tourist)
 *     description: |
 *       ใช้สำหรับสร้าง Booking History โดยระบุว่าแพ็กเกจใดจองโดยใคร
 *       ต้องเป็นผู้ใช้ Role: **Tourist** และต้องแนบ JWT Token ใน Header
 *       สถานะเริ่มต้นของการจองจะเป็น PENDING
 *     tags:
 *       - Booking (Tourist)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสการจอง (reference)
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *               - totalParticipant
 *             properties:
 *               packageId:
 *                 type: integer
 *                 description: รหัสแพ็กเกจที่ต้องการจอง
 *                 example: 5
 *               totalParticipant:
 *                 type: integer
 *                 minimum: 1
 *                 description: จำนวนผู้เข้าร่วม
 *                 example: 2
 *               transferSlip:
 *                 type: string
 *                 maxLength: 256
 *                 description: หลักฐานการโอนเงิน (optional)
 *                 example: "uploads/slips/slip_2025-02-11.png"
 *               touristBankId:
 *                 type: integer
 *                 description: รหัสบัญชีธนาคารของนักท่องเที่ยว (optional)
 *                 example: 1
 *     responses:
 *       201:
 *         description: สร้างข้อมูลการจองสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "สร้างข้อมูลการจองสำเร็จ"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 23
 *                     touristId:
 *                       type: integer
 *                       example: 10
 *                     packageId:
 *                       type: integer
 *                       example: 5
 *                     totalParticipant:
 *                       type: integer
 *                       example: 2
 *                     status:
 *                       type: string
 *                       example: "PENDING"
 *                     bookingAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-11T10:12:45.000Z"
 *                     transferSlip:
 *                       type: string
 *                       nullable: true
 *                       example: "uploads/slips/slip_2025-02-11.png"
 *                     package:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         price:
 *                           type: number
 *                     tourist:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         fname:
 *                           type: string
 *                         lname:
 *                           type: string
 *       400:
 *         description: คำขอไม่ถูกต้อง เช่น แพ็กเกจไม่พบ หรือจำนวนผู้เข้าร่วมเกินความจุ
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ Tourist)
 */

/*
 * เส้นทาง : POST /api/tourist/booking/:bookingId
 * คำอธิบาย : สร้างข้อมูลการจองโดย Tourist
 * รองรับ:
 *   - สร้างการจองใหม่โดยระบุแพ็กเกจและจำนวนผู้เข้าร่วม
 *   - อัปโหลดหลักฐานการโอนเงิน (optional)
 *   - ระบุบัญชีธนาคาร (optional)
 * Input :
 *   - params.bookingId - รหัสการจอง (reference)
 *   - body.packageId - รหัสแพ็กเกจ
 *   - body.totalParticipant - จำนวนผู้เข้าร่วม
 *   - body.transferSlip - หลักฐานการโอนเงิน (optional)
 *   - body.touristBankId - รหัสบัญชีธนาคาร (optional)
 * Output : ข้อมูล Booking History ที่สร้างใหม่
 */
bookingRoutes.post(
  "/tourist/booking/:bookingId",
  authMiddleware,
  allowRoles("tourist"),
  validateDto(BookingHistoryController.createTouristBookingDto),
  BookingHistoryController.createTouristBooking
);

/**
 * @swagger
 * /api/tourist/upload/payment-proof:
 *   post:
 *     summary: อัปโหลดหลักฐานการชำระเงิน (Tourist)
 *     description: |
 *       ใช้สำหรับอัปโหลดไฟล์หลักฐานการชำระเงิน (เช่น ใบสลิปโอนเงิน)
 *       ไฟล์จะถูกบันทึกในโฟลเดอร์ uploads/ และจะถูกบีบอัดอัตโนมัติ (ถ้าเป็นรูปภาพ)
 *       ต้องเป็นผู้ใช้ Role: **Tourist** และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - Booking (Tourist)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - paymentProof
 *             properties:
 *               paymentProof:
 *                 type: string
 *                 format: binary
 *                 description: Payment proof file images jpg, jpeg, png or PDF
 *     responses:
 *       200:
 *         description: อัปโหลดหลักฐานการชำระเงินสำเร็จ
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
 *                   example: "อัปโหลดหลักฐานการชำระเงินสำเร็จ"
 *                 data:
 *                   type: object
 *                   properties:
 *                     filePath:
 *                       type: string
 *                       description: Path ของไฟล์ที่อัปโหลด
 *                       example: "uploads/1739123456789-slip_2025-02-11.png"
 *                     fileName:
 *                       type: string
 *                       description: ชื่อไฟล์ที่อัปโหลด
 *                       example: "1739123456789-slip_2025-02-11.png"
 *       400:
 *         description: คำขอไม่ถูกต้อง เช่น ไม่พบไฟล์หรือไฟล์ไม่ถูกต้อง
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
 *                   example: "ไม่พบไฟล์หลักฐานการชำระเงิน"
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ Tourist)
 */

/*
 * เส้นทาง : POST /api/tourist/upload/payment-proof
 * คำอธิบาย : อัปโหลดหลักฐานการชำระเงินสำหรับการจอง
 * รองรับ:
 *   - อัปโหลดไฟล์หลักฐานการชำระเงิน (รูปภาพ: jpg, jpeg, png หรือ PDF)
 *   - ไฟล์จะถูกบันทึกในโฟลเดอร์ uploads/
 *   - ไฟล์รูปภาพจะถูกบีบอัดอัตโนมัติ
 * Input :
 *   - multipart/form-data with field "paymentProof"
 *   - Authorization header with JWT token
 * Output : ข้อมูล path ของไฟล์ที่อัปโหลด
 */
bookingRoutes.post(
  "/tourist/upload/payment-proof",
  authMiddleware,
  allowRoles("tourist"),
  upload.single("paymentProof"),
  compressUploadedFile,
  BookingHistoryController.uploadPaymentProof
);
bookingRoutes.get(
  "/tourist/booking-history/:id",
  authMiddleware,
  allowRoles("tourist"),
  BookingHistoryController.getBookingDetailForTourist
);
export default bookingRoutes;
