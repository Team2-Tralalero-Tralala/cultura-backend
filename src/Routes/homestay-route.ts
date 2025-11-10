// src/Routes/homestay-routes.ts
import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import { upload } from "~/Libs/uploadFile.js";

import {
  createHomestayDto,
  bulkCreateHomestayDto,
  editHomestayDto,
  createHomestay,
  createHomestaysBulk,
  getHomestayDetail,
  editHomestay,
  getHomestaysAllDto,
  getHomestaysAll,
  getHomestaysAllAdmin,
  createHomestayAdmin,
  editHomestayAdmin,
} from "../Controllers/homestay-controller.js";

const homestayRoutes = Router();

/**
 * SuperAdmin only
 * - สร้างโฮมสเตย์เดี่ยว/หลายรายการใต้ community ที่กำหนด
 * - ดูรายการทั้งหมด (พร้อม filter ผ่าน query)
 * - ดูรายละเอียด/แก้ไขตาม id
 */

homestayRoutes.post(
  "/super/community/:communityId/homestay",
  authMiddleware,
  allowRoles("superadmin"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  // validateDto(createHomestayDto),
  createHomestay
);

homestayRoutes.post(
  "/super/community/:communityId/homestay/bulk",
  authMiddleware,
  allowRoles("superadmin"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  createHomestaysBulk
);

/**
 * @swagger
 * /api/super/homestays/{homestayId}:
 *   get:
 *     summary: ดึงรายละเอียดข้อมูลโฮมสเตย์ตามรหัส (SuperAdmin)
 *     description: |
 *       ใช้สำหรับดึงรายละเอียดข้อมูลของโฮมสเตย์จากรหัส `homestayId`  
 *       ต้องเป็น **SuperAdmin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - SuperAdmin / Homestay
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homestayId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: รหัสของโฮมสเตย์
 *     responses:
 *       200:
 *         description: สำเร็จ - คืนรายละเอียดโฮมสเตย์ตามรหัสที่ระบุ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBase'
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Missing or Invalid Token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       404:
 *         description: ไม่พบข้อมูลโฮมสเตย์ตามที่ระบุ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */
/*
 * เส้นทาง : GET /super/homestays/:homestayId
 * คำอธิบาย : (Super Admin) ดึงรายละเอียดข้อมูลโฮมสเตย์ตามรหัส (homestayId)
 * Input : Path parameter homestayId
 * Output : ข้อมูลรายละเอียดของโฮมสเตย์ในรูปแบบ JSON
 */
homestayRoutes.get(
  "/super/homestays/:homestayId",
  authMiddleware,
  allowRoles("superadmin"),
  getHomestayDetail
);

homestayRoutes.put(
  "/super/homestay/edit/:homestayId",
  authMiddleware,
  allowRoles("superadmin"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  // validateDto(editHomestayDto),
  editHomestay
);

homestayRoutes.get(
  "/super/community/:communityId/homestays",
  validateDto(getHomestaysAllDto),
  authMiddleware,
  allowRoles("superadmin"),
  getHomestaysAll
);

/**
 * @swagger
 * /api/admin/community/homestays/all:
 *   get:
 *     summary: ดึงรายการโฮมสเตย์ทั้งหมดของชุมชน (Admin)
 *     description: |
 *       ใช้สำหรับดึงรายการโฮมสเตย์ทั้งหมดของชุมชนที่ผู้ดูแล (Admin) รับผิดชอบ  
 *       รองรับการแบ่งหน้า (Pagination)  
 *       ต้องเป็น **Admin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - Admin / Homestay
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: หน้าที่ต้องการดึงข้อมูล
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: สำเร็จ - คืนรายการโฮมสเตย์ทั้งหมดของชุมชน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponseBase'
 *       400:
 *         description: คำขอไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Missing or Invalid Token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 */
/*
 * เส้นทาง : GET /admin/community/homestays/all
 * คำอธิบาย : (Admin) ดึงรายการโฮมสเตย์ทั้งหมดของชุมชนที่ผู้ดูแลรับผิดชอบ (รองรับการแบ่งหน้า)
 * Input : Query parameters เช่น page, limit
 * Output : ข้อมูลรายการโฮมสเตย์ทั้งหมดของชุมชนนั้นในรูปแบบ JSON
 */
homestayRoutes.get(
  "/admin/community/homestays/all",
  authMiddleware,
  allowRoles("admin"),
  getHomestaysAllAdmin
);
/**
 * Admin
 * - สร้าง/แก้ไข Homestay ภายในชุมชนของตนเอง
 * (*** หมายเหตุ: หาก role ชื่ออื่นที่ไม่ใช่ 'admin' เช่น 'member' ให้แก้ตรง allowRoles)
 */
homestayRoutes.post(
  "/admin/community/homestay",
  authMiddleware,
  allowRoles("admin"), // อนุญาตทั้ง admin และ superadmin
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  createHomestayAdmin
);

homestayRoutes.put(
  "/admin/community/homestay/edit/:homestayId",
  authMiddleware,
  allowRoles("admin"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  editHomestayAdmin
);

homestayRoutes.get(
  "/admin/homestays/:homestayId",
  authMiddleware,
  allowRoles("admin"),
  getHomestayDetail
);
export default homestayRoutes;
