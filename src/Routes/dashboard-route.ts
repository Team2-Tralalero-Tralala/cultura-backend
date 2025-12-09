import { Router } from "express";
import * as DashboardController from "~/Controllers/dashboard-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const dashboardRoutes = Router();
/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Super Admin dashboard data
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     StandardSuccess:
 *       type: object
 *       properties:
 *         status: { type: integer, example: 200 }
 *         error: { type: boolean, example: false }
 *         message: { type: string, example: "Dashboard data retrieved successfully" }
 *         data: { nullable: true }
 *     StandardError:
 *       type: object
 *       properties:
 *         status: { type: integer, example: 400 }
 *         error: { type: boolean, example: true }
 *         message: { type: string, example: "Bad Request" }
 *         data: { nullable: true }
 *         errorId: { type: string, example: "de305d54-75b4-431b-adb2-eb6b9e546014" }
 *         errors: { nullable: true }
 *     DashboardSummary:
 *       type: object
 *       properties:
 *         totalPackages: { type: integer, example: 125 }
 *         totalCommunities: { type: integer, example: 42 }
 *         successBookingCount: { type: integer, example: 980 }
 *         cancelledBookingCount: { type: integer, example: 120 }
 *     SuperDashboardData:
 *       type: object
 *       properties:
 *         summary:
 *           $ref: '#/components/schemas/DashboardSummary'
 *         graph:
 *           type: array
 *           description: Data points grouped by the requested interval
 *           items:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: "2025-11-01"
 *               value:
 *                 type: number
 *                 example: 123
 *
 * paths:
 *   /api/super/dashboard:
 *     get:
 *       tags: [Dashboard]
 *       summary: Get Super Admin dashboard data
 *       description: |
 *         Returns summary KPIs and grouped graph data across all communities. Requires Super Admin role.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: dateStart
 *           required: true
 *           schema: { type: string, example: "2025-10-01" }
 *           description: Start date (yyyy-MM-dd)
 *         - in: query
 *           name: dateEnd
 *           required: true
 *           schema: { type: string, example: "2025-11-01" }
 *           description: End date (yyyy-MM-dd)
 *         - in: query
 *           name: page
 *           schema: { type: integer, minimum: 1, example: 1 }
 *           description: Page number (pagination)
 *         - in: query
 *           name: limit
 *           schema: { type: integer, minimum: 1, maximum: 100, example: 10 }
 *           description: Page size (pagination)
 *         - in: query
 *           name: groupBy
 *           schema:
 *             type: string
 *             enum: [hour, day, week, month, year]
 *             example: "day"
 *           description: Grouping interval for graph data
 *         - in: query
 *           name: province
 *           schema: { type: string }
 *           description: Optional province filter
 *         - in: query
 *           name: region
 *           schema: { type: string }
 *           description: Optional region filter
 *         - in: query
 *           name: search
 *           schema: { type: string }
 *           description: Optional search keyword
 *       responses:
 *         200:
 *           description: Dashboard data retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                   - $ref: '#/components/schemas/StandardSuccess'
 *                   - type: object
 *                     properties:
 *                       data:
 *                         $ref: '#/components/schemas/SuperDashboardData'
 *         400:
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 *         401:
 *           description: Unauthorized (missing/invalid token)
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 *         403:
 *           description: Forbidden (not superadmin)
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 */

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
  validateDto(DashboardController.getMemberDashboardDto),
  DashboardController.getAdminDashboard
);

/**
 * @swagger
 * /api/member/dashboard:
 *   get:
 *     summary: แสดงข้อมูล Dashboard ของสมาชิก (Member)
 *     description: |
 *       ดึงข้อมูลสรุป (summary), กราฟ (graph) และแพ็กเกจยอดนิยม (top packages) ของสมาชิก
 *       สามารถกรองข้อมูลตามช่วงเวลาสำหรับ Booking, Revenue และ Top Packages ได้แยกกัน
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingPeriodType
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *         description: ประเภทช่วงเวลาสำหรับกราฟการจอง (booking)
 *       - in: query
 *         name: bookingDates
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: วันที่สำหรับกราฟการจอง (YYYY-MM-DD)
 *       - in: query
 *         name: revenuePeriodType
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *         description: ประเภทช่วงเวลาสำหรับกราฟรายได้ (revenue)
 *       - in: query
 *         name: revenueDates
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: วันที่สำหรับกราฟรายได้ (YYYY-MM-DD)
 *       - in: query
 *         name: packagePeriodType
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *         description: ประเภทช่วงเวลาสำหรับแพ็กเกจยอดนิยม (top packages)
 *       - in: query
 *         name: packageDates
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: วันที่สำหรับแพ็กเกจยอดนิยม (YYYY-MM-DD)
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
 *                           example: 5
 *                         totalRevenue:
 *                           type: number
 *                           example: 15000
 *                         successBookingCount:
 *                           type: integer
 *                           example: 20
 *                         cancelledBookingCount:
 *                           type: integer
 *                           example: 2
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
 *                               example: ["01/01", "02/01"]
 *                             data:
 *                               type: array
 *                               items:
 *                                 type: number
 *                               example: [5, 10]
 *                         revenueGraph:
 *                           type: object
 *                           properties:
 *                             labels:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["01/01", "02/01"]
 *                             data:
 *                               type: array
 *                               items:
 *                                 type: number
 *                               example: [5000, 10000]
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
 *                                 example: "Package A"
 *                               bookingCount:
 *                                 type: integer
 *                                 example: 15
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
  "/member/dashboard",
  validateDto(DashboardController.getMemberDashboardDto),
  authMiddleware,
  allowRoles("member"),
  DashboardController.getMemberDashboard
);

export default dashboardRoutes;
