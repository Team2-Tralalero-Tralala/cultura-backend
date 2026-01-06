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
import * as packageRequestController from "~/Controllers/package-request-controller.js";
const packageRequestRoutes = Router();

/**
 * @swagger
 * /api/super/package-requests:
 *   get:
 *     tags: [Package Requests]
 *     summary: ดึงรายการ "คำขออนุมัติแพ็กเกจ" (พร้อมค้นหา/กรอง + แบ่งหน้า)
 *     description: |
 *       - **superadmin**: เห็นทุกคำขอ
 *       - **admin**: เห็นเฉพาะคำขอของชุมชนที่ตนดูแล
 *       ถ้าไม่ส่ง `statusApprove` หรือส่ง `all` จะใช้ดีฟอลต์ตามตรรกะระบบ
 *       ทุกคำตอบถูกห่อด้วย `createResponse` หรือ `createErrorResponse`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: คำค้นหา (เช่น ชื่อแพ็กเกจ/ชื่อชุมชน)
 *       - in: query
 *         name: statusApprove
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVE, PENDING_SUPER, all]
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_PackageRequestListPage'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Package requests retrieved successfully"
 *                   data:
 *                     data:
 *                       - id: 123
 *                         name: "แพ็กเกจ A"
 *                         statusApprove: "PENDING_SUPER"
 *                         community: { id: 10, name: "ชุมชนเขาใหญ่" }
 *                         overseer: { id: 7, username: "overseer01" }
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 3
 *                       totalCount: 25
 *                       limit: 10
 *       400:
 *         description: validation ผิดพลาด / คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       401:
 *         description: ไม่ได้ยืนยันตัวตน
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     CreateErrorResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         message: { type: string }
 *       required: [success, message]
 *
 *     CreateResponse_PackageRequestListPage:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         message: { type: string, example: "Package requests retrieved successfully" }
 *         data:
 *           $ref: '#/components/schemas/PackageRequestListPage'
 *       required: [success, message, data]
 *
 *     PackageRequestListPage:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items: { $ref: '#/components/schemas/PackageRequestListItem' }
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *       required: [data, pagination]
 *
 *     PackageRequestListItem:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 123 }
 *         name: { type: string, example: "แพ็กเกจ A" }
 *         statusApprove:
 *           type: string
 *           nullable: true
 *           example: "PENDING_SUPER"
 *         community:
 *           type: object
 *           properties:
 *             id: { type: integer, example: 10 }
 *             name: { type: string, example: "ชุมชนเขาใหญ่" }
 *           required: [id, name]
 *         overseer:
 *           type: object
 *           properties:
 *             id: { type: integer, example: 7 }
 *             username: { type: string, example: "overseer01" }
 *           required: [id, username]
 *       required: [id, name, community, overseer]
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage: { type: integer, example: 1 }
 *         totalPages:  { type: integer, example: 3 }
 *         totalCount:  { type: integer, example: 25 }
 *         limit:       { type: integer, example: 10 }
 *       required: [currentPage, totalPages, totalCount, limit]
 */

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
 * @swagger
 * /api/super/package-requests/{packageId}/approve:
 *   patch:
 *     tags: [Package Requests]
 *     summary: อนุมัติคำขอแพ็กเกจ (สำหรับ SuperAdmin/Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: อนุมัติสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_PackageRequestActionResult'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Approved package request successfully"
 *                   data: { id: 123, statusApprove: "APPROVE" }
 *       400:
 *         description: อนุมัติไม่ได้ / คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       401:
 *         description: ไม่ได้ยืนยันตัวตน
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       404:
 *         description: ไม่พบคำขอแพ็กเกจ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *
 * components:
 *   schemas:
 *     CreateResponse_PackageRequestActionResult:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         message: { type: string, example: "Approved package request successfully" }
 *         data:
 *           type: object
 *           properties:
 *             id: { type: integer, example: 123 }
 *             statusApprove: { type: string, example: "APPROVE" }
 *       required: [success, message, data]
 */

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
 * @swagger
 * /api/super/package-requests/{packageId}/reject:
 *   patch:
 *     tags: [Package Requests]
 *     summary: ปฏิเสธคำขอแพ็กเกจ (สำหรับ SuperAdmin/Admin)
 *     description: อาจรองรับเหตุผลการปฏิเสธใน body (เลือกใส่ได้)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: "ข้อมูลไม่ครบถ้วน" }
 *     responses:
 *       200:
 *         description: ปฏิเสธสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_PackageRequestActionResult'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Rejected package request successfully"
 *                   data: { id: 123, statusApprove: "REJECT" }
 *       400:
 *         description: ปฏิเสธไม่ได้ / คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       401:
 *         description: ไม่ได้ยืนยันตัวตน
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       404:
 *         description: ไม่พบคำขอแพ็กเกจ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 */

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
/**
 * รายละเอียดแพ็กเกจจากหน้าคำขอแพ็กเกจ (สำหรับ superadmin)
 */
packageRequestRoutes.get(
    "/super/package-requests/:requestId",
    validateDto(packageRequestController.getDetailRequestForAdminDto),
    authMiddleware, 
    allowRoles("superadmin"), 
    packageRequestController.getDetailRequest
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
  validateDto(packageRequestController.getDetailRequestForAdminDto),
  authMiddleware,
  allowRoles("admin"),
  packageRequestController.getDetailRequestForAdmin
);


/**
 * @swagger
 * /api/admin/package-requests/{packageId}/approve:
 *   patch:
 *     tags: [Package Requests]
 *     summary: อนุมัติคำขอ (สำหรับ Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: อนุมัติสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_PackageRequestActionResult'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Approved package request successfully"
 *                   data: { id: 123, statusApprove: "APPROVE" }
 *       400:
 *         description: อนุมัติไม่ได้ / คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       401:
 *         description: ไม่ได้ยืนยันตัวตน
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       403:
 *         description: ต้องเป็น admin เท่านั้น
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       404:
 *         description: ไม่พบคำขอแพ็กเกจ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 */

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
 * @swagger
 * /api/admin/package-requests/{packageId}/reject:
 *   patch:
 *     tags: [Package Requests]
 *     summary: ปฏิเสธคำขอ (สำหรับ Admin)
 *     description: อาจรองรับเหตุผลการปฏิเสธใน body (เลือกใส่ได้)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: "ข้อมูลไม่ครบถ้วน" }
 *     responses:
 *       200:
 *         description: ปฏิเสธสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_PackageRequestActionResult'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Rejected package request successfully"
 *                   data: { id: 123, statusApprove: "REJECT" }
 *       400:
 *         description: ปฏิเสธไม่ได้ / คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       401:
 *         description: ไม่ได้ยืนยันตัวตน
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       403:
 *         description: ต้องเป็น admin เท่านั้น
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 *       404:
 *         description: ไม่พบคำขอแพ็กเกจ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateErrorResponse' }
 */

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
