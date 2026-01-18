import { Router } from "express";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import {
    disableServer,
    enableServer,
    getServerStatus,
} from "../Controllers/config-controller.js";

const configRoutes = Router();

/**
 * @swagger
 * tags:
 *   - name: Config
 *     description: Server configuration & status
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
 *     ConfigStatusData:
 *       type: object
 *       properties:
 *         serverOnline:
 *           type: boolean
 *           example: true
 *     ConfigStatusResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StandardSuccess'
 *         - type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "ดึงข้อมูลสถานะเซิร์ฟเวอร์สำเร็จ"
 *             data:
 *               $ref: '#/components/schemas/ConfigStatusData'
 *
 * paths:
 *   /api/shared/server-status:
 *     get:
 *       tags: [Config]
 *       summary: Get current server status
 *       description: |
 *         Returns the current server status information.
 *         This endpoint is publicly accessible and does not require authentication.
 *       responses:
 *         200:
 *           description: Server status retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ConfigStatusResponse'
 *         500:
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *
 *   /api/super/server/enable:
 *     post:
 *       tags: [Config]
 *       summary: Enable the server
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Server enabled
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                   - $ref: '#/components/schemas/StandardSuccess'
 *                   - type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                         example: "Server enabled successfully"
 *                       data:
 *                         $ref: '#/components/schemas/ConfigStatusData'
 *         401:
 *           description: Unauthorized
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 *         403:
 *           description: Forbidden
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 *         500:
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 *
 *   /api/super/server/disable:
 *     post:
 *       tags: [Config]
 *       summary: Disable the server
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Server disabled
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                   - $ref: '#/components/schemas/StandardSuccess'
 *                   - type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                         example: "Server disabled successfully"
 *                       data:
 *                         $ref: '#/components/schemas/ConfigStatusData'
 *         401:
 *           description: Unauthorized
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 *         403:
 *           description: Forbidden
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 *         500:
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema: { $ref: '#/components/schemas/StandardError' }
 */


// GET /shared/server-status - ดูสถานะการทำงานของเซิร์ฟเวอร์
configRoutes.get("/shared/server-status", getServerStatus);

// POST /super/server/enable - เปิดเซิร์ฟเวอร์
configRoutes.post("/super/server/enable",
    authMiddleware,
    allowRoles("superadmin"),
    enableServer);

// POST /super/server/disable - ปิดเซิร์ฟเวอร์
configRoutes.post("/super/server/disable",
    authMiddleware,
    allowRoles("superadmin"),
    disableServer);

export default configRoutes;
