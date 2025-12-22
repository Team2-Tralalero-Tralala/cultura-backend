import { Router } from "express";
import * as middlewares from "~/Middlewares/auth-middleware.js";
import * as FeedbackController from "~/Controllers/feedback-controller.js";
import { validateDto } from "~/Libs/validateDto.js";

import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import { upload } from "~/Libs/uploadFile.js";

const feedbackRoutes = Router();
/**
 * @swagger
 * /api/admin/package/feedbacks/{packageId}:
 *   get:
 *     summary: ดึงรายการ feedback ของแพ็กเกจ (สำหรับผู้ดูแลระบบ)
 *     description: แสดงข้อมูล feedback ทั้งหมดของแพ็กเกจที่เลือก โดยต้องเป็นผู้ดูแลระบบเท่านั้น
 *     tags: [Admin - Package Feedback]
 *     security:
 *       - bearerAuth: []   # ต้องใช้ JWT Bearer Token
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         description: รหัสของแพ็กเกจที่ต้องการดู feedback
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: สำเร็จ - ส่งคืน feedback ของแพ็กเกจ
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
 *                   example: "ดึงรายการ feedback สำเร็จ"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 7
 *                           name:
 *                             type: string
 *                             example: "สมชาย ใจดี"
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                       comment:
 *                         type: string
 *                         example: "แพ็กเกจดีมาก!"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-05T08:15:30.000Z"
 *       400:
 *         description: Bad Request - ส่งค่าไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - ไม่มีสิทธิ์เข้าถึง (JWT ผิดหรือหมดอายุ)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: ไม่พบแพ็กเกจหรือ feedback ที่เกี่ยวข้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/*
 * คำอธิบาย : Routes สำหรับดึงฟีดแบ็กทั้งหมดของแพ็กเกจ (เฉพาะแอดมิน)
 * Path : /api/admin/package/feedback/:packageId
 * Access : admin
 */

feedbackRoutes.get(
  "/admin/package/feedbacks/:packageId",
  authMiddleware,
  allowRoles("admin"),
  FeedbackController.getPackageFeedbacksForAdmin
);

/**
 * @swagger
 * /api/member/feedbacks/all:
 *   get:
 *     tags:
 *       - Member - Feedbacks
 *     summary: Get all feedbacks submitted by the logged-in member
 *     description: |
 *       ดึงรายการ Feedback ทั้งหมดที่สมาชิก (role: **member**) เคยส่ง
 *       ทุก response อยู่ในรูปแบบ `createResponse` หรือ `createErrorResponse`
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงรายการ Feedback สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Get all feedbacks successfully
 *                 data:
 *                   type: array
 *                   description: รายการ feedback ทั้งหมดของ member
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       packageId:
 *                         type: integer
 *                         example: 5
 *                       rating:
 *                         type: integer
 *                         example: 4
 *                       comment:
 *                         type: string
 *                         example: "ที่พักดีมาก บริการเยี่ยม"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-12T14:30:00Z"
 *                 meta:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: ไม่ได้ส่ง JWT Bearer token หรือ token ไม่ถูกต้อง (Unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       403:
 *         description: Forbidden – ผู้ใช้ไม่มีสิทธิ์ member
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Forbidden resource
 *       500:
 *         description: Internal server error (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/*
 * คำอธิบาย : Routes สำหรับดึงฟีดแบ็กทั้งหมดของแพ็กเกจ (เฉพาะสมาชิก)
 * Path : /api/member/feedbacks/all
 * Access : member
 */

feedbackRoutes.get(
  "/member/feedbacks/all",
  middlewares.authMiddleware,
  middlewares.allowRoles("member"),
  FeedbackController.getMemberAllFeedbacks
);
/*
 * /api/member/feedback/{feedbackId}/reply:
 *   post:
 *     summary: ส่งคำตอบกลับ Feedback ของสมาชิก
 *     description: สมาชิกสามารถส่งข้อความตอบกลับบน Feedback ของตนเองได้
 *     tags:
 *       - Feedback (Member)
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         description: ID ของ Feedback
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/replyFeedbackDto'
 *             example:
 *                     {
 *                       "replyMessage": "ขอบคุณ"
 *                     }
 *     responses:
 *       200:
 *         description: ตอบกลับ Feedback สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FeedbackReply'
 *
 *       400:
 *         description: ส่งข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบหรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: ไม่มีสิทธิ์ตอบกลับ Feedback นี้
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/*
 * คำอธิบาย : Routes สำหรับตอบกลับรีวิว (เฉพาะ member)
 * Path : /api/member/feedback/:feedbackId/reply"
 * Access : member
 */
feedbackRoutes.post(
  "/member/feedback/:feedbackId/reply",
  authMiddleware,
  allowRoles("member"),
  validateDto(FeedbackController.replyFeedbackDto),
  FeedbackController.replyFeedback
);

/**
 * @swagger
 * /api/member/feedback/{feedbackId}/reply:
 *   post:
 *     summary: ส่งคำตอบกลับ Feedback ของสมาชิก
 *     description: สมาชิกสามารถส่งข้อความตอบกลับบน Feedback ของตนเองได้
 *     tags:
 *       - Feedback (Member)
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         description: ID ของ Feedback
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/replyFeedbackDto'
 *
 *     responses:
 *       200:
 *         description: ตอบกลับ Feedback สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FeedbackReply'
 *
 *       400:
 *         description: ส่งข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบหรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: ไม่มีสิทธิ์ตอบกลับ Feedback นี้
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

feedbackRoutes.get(
  "/member/package/feedbacks/:packageId",
  authMiddleware,
  allowRoles("member"),
  FeedbackController.getPackageFeedbacksForMember
);

/*
 * /api/admin/feedback/{feedbackId}/reply:
 *   post:
 *     summary: ส่งคำตอบกลับ Feedback ของสมาชิก
 *     description: สมาชิกสามารถส่งข้อความตอบกลับบน Feedback ของตนเองได้
 *     tags:
 *       - Feedback (admin)
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         description: ID ของ Feedback
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/replyFeedbackDto'
 *             example:
 *                     {
 *                       "replyMessage": "ขอบคุณ"
 *                     }
 *     responses:
 *       200:
 *         description: ตอบกลับ Feedback สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FeedbackReply'
 *
 *       400:
 *         description: ส่งข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบหรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: ไม่มีสิทธิ์ตอบกลับ Feedback นี้
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/*
 * คำอธิบาย : Routes สำหรับตอบกลับรีวิว (เฉพาะ admin)
 * Path : /api/admin/feedback/:feedbackId/reply"
 * Access : admin
 */
feedbackRoutes.post(
  "/admin/feedback/:feedbackId/reply",
  authMiddleware,
  allowRoles("admin"),
  validateDto(FeedbackController.replyFeedbackDto),
  FeedbackController.replyFeedbackAdmin
);

/**
 * @swagger
 * /api/tourist/booking-history/{bookingId}/feedback:
 *   post:
 *     tags: [Tourist - Feedback]
 *     summary: ส่ง Feedback สำหรับการจอง
 *     description: นักท่องเที่ยวส่งคะแนน ความคิดเห็น และรูปภาพ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 example: 5
 *               message:
 *                 type: string
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: ส่ง Feedback สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: Unauthorized
 */

/*
 * คำอธิบาย : Routes สำหรับนักท่องเที่ยวส่ง Feedback หลังการจองแพ็กเกจ
 * Path : /api/tourist/booking-history/:bookingId/feedback
 * Method : POST
 * Access : tourist
 * Body :
 *   - rating (number) : คะแนนที่ให้ (1–5)
 *   - message (string) : ข้อเสนอแนะ (optional)
 *   - gallery (file[]) : รูปภาพประกอบ (สูงสุด 5 รูป)
 * Output :
 *   - ส่ง Feedback สำเร็จ หรือ error ตามกรณี
 */
feedbackRoutes.post(
  "/tourist/booking-history/:bookingId/feedback",
  authMiddleware,
  allowRoles("tourist"),
  upload.fields([{ name: "gallery", maxCount: 5 }]),
  validateDto(FeedbackController.createFeedbackDto),
  FeedbackController.createFeedback
);
export default feedbackRoutes;
