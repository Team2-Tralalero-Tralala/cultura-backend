import { Router } from "express";
import * as middlewares from "~/Middlewares/auth-middleware.js";
import * as feedbackController from "~/Controllers/feedback-controller.js";

const packageFeedbackRoutes = Router();
/**
 * @swagger
 * /api/admin/package/feedback/{packageId}:
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
packageFeedbackRoutes.get(
  "/admin/package/feedback/:packageId",
  middlewares.authMiddleware,
  middlewares.allowRoles("admin"),
  feedbackController.getPackageFeedbacks
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

packageFeedbackRoutes.get(
  "/member/feedbacks/all",
  middlewares.authMiddleware,
  middlewares.allowRoles("member"),
  feedbackController.getMemberAllFeedbacks
);

export default packageFeedbackRoutes;
