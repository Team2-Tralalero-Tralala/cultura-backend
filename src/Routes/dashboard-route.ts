import { Router } from "express";
import * as DashboardController from "~/Controllers/dashboard-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const dashboardRoutes = Router();

dashboardRoutes.get(
  "/super/dashboard",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(DashboardController.getSuperAdminDashboardDto),
  DashboardController.getSuperAdminDashboard
);
/*
 * คำอธิบาย : ใช้สำหรับดึงข้อมูล Dashboard ของ Admin
 */
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: แสดงข้อมูล Dashboard ของผู้ดูแลชุมชน (Admin)
 *     description: |
 *       ดึงข้อมูลสรุป (summary), กราฟ (graph) และแพ็กเกจยอดนิยม (top packages) ของชุมชนที่ admin ดูแล
 *       โดยจะตรวจสอบสิทธิ์ผ่าน JWT และ role ต้องเป็น `admin` เท่านั้น
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           example: "2025-10-31"
 *         description: วันที่เริ่มต้นของช่วงเวลาที่ต้องการดึงข้อมูล (รูปแบบ yyyy-MM-dd)
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           example: "2025-11-01"
 *         description: วันที่สิ้นสุดของช่วงเวลาที่ต้องการดึงข้อมูล (รูปแบบ yyyy-MM-dd)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month, year]
 *           example: "day"
 *         description: รูปแบบการจัดกลุ่มข้อมูลกราฟ เช่น รายวัน รายเดือน เป็นต้น
 *     responses:
 *       200:
 *         description: ดึงข้อมูล Dashboard สำเร็จ
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
 *                   example: "Dashboard data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPackages:
 *                           type: integer
 *                           example: 1
 *                         totalRevenue:
 *                           type: number
 *                           example: 1000
 *                         successBookingCount:
 *                           type: integer
 *                           example: 1
 *                         cancelledBookingCount:
 *                           type: integer
 *                           example: 0
 *                     graph:
 *                       type: object
 *                       properties:
 *                         bookingCountGraph:
 *                           type: object
 *                           properties:
 *                             labels:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["2025-10-31", "2025-11-01"]
 *                             data:
 *                               type: array
 *                               items:
 *                                 type: number
 *                               example: [0, 0]
 *                         revenueGraph:
 *                           type: object
 *                           properties:
 *                             labels:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["2025-10-31", "2025-11-01"]
 *                             data:
 *                               type: array
 *                               items:
 *                                 type: number
 *                               example: [0, 0]
 *                     package:
 *                       type: object
 *                       properties:
 *                         topPackages:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               rank:
 *                                 type: integer
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: "Eco Tour"
 *                               bookingCount:
 *                                 type: integer
 *                                 example: 1
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (สิทธิ์ไม่เพียงพอ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Forbidden
 */
dashboardRoutes.get(
  "/admin/dashboard",
  authMiddleware,
  allowRoles("admin"),
  validateDto(DashboardController.getAdminDashboardDto),
  DashboardController.getAdminDashboard
);

export default dashboardRoutes;
