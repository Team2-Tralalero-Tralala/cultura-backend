/*
 * คำอธิบาย : Routes สำหรับดึงรายการคำขอแพ็กเกจ (เฉพาะฟิลด์ที่จำเป็น)
 * Path : /api/super/package-requests
 * Access : superadmin, admin
 */

import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import {
    getPackageRequestAll,
    getPackageRequestAllDto,
    patchApprovePackageRequest,
    patchRejectPackageRequest,
    getDetailRequest,
    getDetailRequestForAdmin,
    patchApprovePackageRequestForAdmin,
    patchRejectPackageRequestDto,
    patchRejectPackageRequestForAdmin,
} from "~/Controllers/package-request-controller.js";
const packageRequestRoutes = Router();

/**
 * ดึงรายการคำขอ (list)
 */
packageRequestRoutes.get(
    "/super/package-requests",
    authMiddleware,
    allowRoles("superadmin", "admin"),
    validateDto(getPackageRequestAllDto),
    getPackageRequestAll
);

/**
 * อนุมัติคำขอ
 */
packageRequestRoutes.patch(
    "/super/package-requests/:packageId/approve",
    authMiddleware,
    allowRoles("superadmin", "admin"),
    patchApprovePackageRequest
);

/**
 * ปฏิเสธคำขอ
 */
packageRequestRoutes.patch(
    "/super/package-requests/:packageId/reject",
    authMiddleware,
    allowRoles("superadmin", "admin"),
    patchRejectPackageRequest
);
/**
 * @swagger
 * /api/super/package-requests/{requestId}:
 *   get:
 *     tags:
 *       - Package Requests (Superadmin)
 *     summary: Get detail of a pending super package request
 *     description: >
 *       ดึงรายละเอียดแพ็กเกจจากหน้าคำขออนุมัติโดย **superadmin**  
 *       ข้อมูลจะถูกคืนกลับในรูปแบบ `createResponse` และจะดึงได้เฉพาะแพ็กเกจที่มีสถานะ `PENDING_SUPER`
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 4
 *         description: ID ของคำขอแพ็กเกจ (packageId)
 *     responses:
 *       200:
 *         description: Get pending super package successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get pending super package successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: แพ็กเกจท่องเที่ยวเชียงใหม่ 3 วัน 2 คืน
 *                     description:
 *                       type: string
 *                       example: แพ็กเกจท่องเที่ยวพร้อมที่พักและอาหารเช้า
 *                     capacity:
 *                       type: integer
 *                       example: 30
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 1999
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                     bookingOpenDate:
 *                       type: string
 *                       format: date-time
 *                     bookingCloseDate:
 *                       type: string
 *                       format: date-time
 *                     facility:
 *                       type: string
 *                       example: รถรับส่ง, อาหารเช้า, Wi-Fi
 *                     overseerPackage:
 *                       type: object
 *                       properties:
 *                         fname:
 *                           type: string
 *                           example: Somchai
 *                         lname:
 *                           type: string
 *                           example: Jaidee
 *                     createPackage:
 *                       type: object
 *                       properties:
 *                         fname:
 *                           type: string
 *                           example: Chanida
 *                         lname:
 *                           type: string
 *                           example: Wong
 *                     tagPackages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: ทะเล
 *                     packageFile:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filePath:
 *                             type: string
 *                             example: /uploads/packages/1234/file.pdf
 *                     location:
 *                       type: object
 *                       properties:
 *                         houseNumber:
 *                           type: string
 *                           nullable: true
 *                         villageNumber:
 *                           type: string
 *                           nullable: true
 *                         alley:
 *                           type: string
 *                           nullable: true
 *                         subDistrict:
 *                           type: string
 *                           example: สุเทพ
 *                         district:
 *                           type: string
 *                           example: เมืองเชียงใหม่
 *                         province:
 *                           type: string
 *                           example: เชียงใหม่
 *                         postalCode:
 *                           type: string
 *                           example: "50200"
 *                         detail:
 *                           type: string
 *                           nullable: true
 *                         latitude:
 *                           type: number
 *                           format: float
 *                           nullable: true
 *                         longitude:
 *                           type: number
 *                           format: float
 *                           nullable: true
 *       404:
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Package not found
 *       400:
 *         description: Bad request or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: requestId must be a number
 */
packageRequestRoutes.get(
    "/super/package-requests/:requestId", 
    authMiddleware, 
    allowRoles("superadmin"), 
    getDetailRequest
);

/**
 * รายละเอียดแพ็กเกจจากหน้าคำขอแพ็กเกจ (สำหรับ superadmin)
 */
packageRequestRoutes.get(
    "/super/package-requests/:requestId", 
    authMiddleware, 
    allowRoles("superadmin"), 
    getDetailRequest
);

/**
 * @swagger
 * /api/admin/package-requests/{requestId}:
 *   get:
 *     tags:
 *       - Package Requests (Admin)
 *     summary: Get detail of a package request for admin
 *     description: >
 *       ดึงรายละเอียดคำขอแพ็กเกจโดยผู้ดูแลระบบ (**admin**)  
 *       ข้อมูลจะถูกคืนกลับในรูปแบบ `createResponse`  
 *       ต้องแนบ **Bearer JWT Token** ใน header เพื่อเข้าถึง
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 4
 *         description: รหัสคำขอแพ็กเกจ
 *     responses:
 *       200:
 *         description: Get package request detail successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get package request detail successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 4
 *                     name:
 *                       type: string
 *                       example: แพ็กเกจเที่ยวเหนือ 3 วัน 2 คืน
 *                     description:
 *                       type: string
 *                       example: ทริปเที่ยวเหนือสำหรับ 3 วัน 2 คืน พร้อมที่พัก
 *                     status:
 *                       type: string
 *                       example: pending
 *                     createPackage:
 *                       type: object
 *                       properties:
 *                         fname:
 *                           type: string
 *                           example: Anucha
 *                         lname:
 *                           type: string
 *                           example: Wongdee
 *                     overseerPackage:
 *                       type: object
 *                       properties:
 *                         fname:
 *                           type: string
 *                           example: Somchai
 *                         lname:
 *                           type: string
 *                           example: Jaidee
 *                     tagPackages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: ภูเขา
 *                     packageFile:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filePath:
 *                             type: string
 *                             example: /uploads/package/4/file.jpg
 *                     location:
 *                       type: object
 *                       properties:
 *                         province:
 *                           type: string
 *                           example: เชียงใหม่
 *                         district:
 *                           type: string
 *                           example: เมืองเชียงใหม่
 *                         subDistrict:
 *                           type: string
 *                           example: สุเทพ
 *                         postalCode:
 *                           type: string
 *                           example: "50200"
 *       404:
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Package not found
 *       400:
 *         description: Bad request or invalid parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: requestId must be a number
 */
/**
 * รายละเอียดแพ็กเกจจากหน้าคำขอแพ็กเกจ (สำหรับ admin)
 */
packageRequestRoutes.get(
    "/admin/package-requests/:requestId", 
    authMiddleware, 
    allowRoles("admin"), 
    getDetailRequestForAdmin
);

/**
 * อนุมัติคำขอ (สำหรับ Admin)
 */
packageRequestRoutes.patch(
    "/admin/package-requests/:packageId/approve", // Path ใหม่สำหรับ admin
    authMiddleware,
    allowRoles("admin"), // เฉพาะ admin
    patchApprovePackageRequestForAdmin
);

/**
 * ปฏิเสธคำขอ (สำหรับ Admin)
 */
packageRequestRoutes.patch(
    "/admin/package-requests/:packageId/reject", // Path ใหม่สำหรับ admin
    authMiddleware,
    allowRoles("admin"), // เฉพาะ admin
    // validateDto(patchRejectPackageRequestDto), // ใช้ DTO ตัวเดียวกัน
    patchRejectPackageRequestForAdmin
);

export default packageRequestRoutes;
