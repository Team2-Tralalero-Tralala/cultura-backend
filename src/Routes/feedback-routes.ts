import { Router } from "express";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import { getPackageFeedbacks } from "~/Controllers/feedback-controller.js";

const packageFeedbackAdminRoutes = Router();
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

packageFeedbackAdminRoutes.get(
  "/admin/package/feedback/:packageId",
  authMiddleware,
  allowRoles("admin"),
  getPackageFeedbacks
);

export default packageFeedbackAdminRoutes;
