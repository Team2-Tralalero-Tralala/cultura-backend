/*
 * คำอธิบาย : Routes สำหรับ Log Management
 * ประกอบด้วย endpoints สำหรับดึงข้อมูล logs ตาม role
 */
import { Router } from "express";
import { getLogs, getLogsDto } from "../Controllers/log-controller.js";
import { validateDto } from "../Libs/validateDto.js";
import { allowRoles, authMiddleware } from "../Middlewares/auth-middleware.js";

const logRoutes = Router();

/**
 * @swagger
 * tags:
 *   - name: Logs
 *     description: System and activity logs (shared)
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
 *         message: { type: string, example: "OK" }
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
 *     LogItem:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         level: { type: string, example: "INFO" }
 *         message: { type: string, example: "User login successful" }
 *         context: { type: string, example: "AuthService" }
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-11T06:20:00.000Z"
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage: { type: integer, example: 1 }
 *         totalPages: { type: integer, example: 5 }
 *         totalCount: { type: integer, example: 200 }
 *         limit: { type: integer, example: 20 }
 *     LogListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StandardSuccess'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LogItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *
 * paths:
 *   /api/shared/logs:
 *     get:
 *       tags: [Logs]
 *       summary: Retrieve system logs
 *       description: |
 *         Returns a paginated list of logs filtered by level, search term, and date range.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: page
 *           schema: { type: integer, example: 1 }
 *           description: Page number
 *         - in: query
 *           name: limit
 *           schema: { type: integer, example: 20 }
 *           description: Number of results per page
 *         - in: query
 *           name: search
 *           schema: { type: string, example: "login" }
 *           description: Search logs by message text
 *         - in: query
 *           name: level
 *           schema:
 *             type: string
 *             enum: [INFO, WARN, ERROR]
 *             example: INFO
 *           description: Filter by log level
 *         - in: query
 *           name: dateStart
 *           schema: { type: string, example: "2025-11-01" }
 *           description: Filter logs created after this date (yyyy-MM-dd)
 *         - in: query
 *           name: dateEnd
 *           schema: { type: string, example: "2025-11-11" }
 *           description: Filter logs created before this date (yyyy-MM-dd)
 *       responses:
 *         200:
 *           description: Logs retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/LogListResponse'
 *         401:
 *           description: Unauthorized
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 *         400:
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 */

/*
 * GET /logs
 * คำอธิบาย : ดึงข้อมูล logs ตาม role ของผู้ใช้พร้อม pagination
 * Access : สำหรับผู้ใช้ที่ login แล้วทุก role
 * Logic :
 *   - superadmin เห็น logs ทั้งหมด
 *   - admin เห็น logs ของสมาชิกในชุมชนที่ตนเป็น admin
 * Query Parameters :
 *   - page (optional) : หน้าที่ต้องการ (default: 1)
 *   - limit (optional) : จำนวนรายการต่อหน้า (default: 10, max: 100)
 *   - search (optional) : คำค้นหา (username, email, fname, lname)
 */
logRoutes.get(
  "/",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(getLogsDto),
  getLogs
);

export default logRoutes;
