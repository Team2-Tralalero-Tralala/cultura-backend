import { Router } from "express";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import * as FeedbackController from "~/Controllers/feedback-controller.js";
import { validateDto } from "~/Libs/validateDto.js";

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

export default feedbackRoutes;
