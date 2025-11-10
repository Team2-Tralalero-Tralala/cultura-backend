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
/**
 * @swagger
 * /api/super/community/{communityId}/homestays:
 *   get:
 *     summary: ดึงรายการที่พัก (Homestays) ทั้งหมดภายในชุมชน (สำหรับ Super Admin)
 *     description: |
 *       ใช้สำหรับดึงข้อมูลที่พัก (Homestays) ทั้งหมดของชุมชนที่ระบุ  
 *       พร้อม pagination และตรวจสอบสิทธิ์เฉพาะ SuperAdmin เท่านั้น
 *     tags:
 *       - Homestay (Super Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: รหัสของชุมชนที่ต้องการดึงรายการที่พัก
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: หน้าที่ต้องการ (ค่าเริ่มต้นคือ 1)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: จำนวนรายการต่อหน้า (ค่าเริ่มต้นคือ 10)
 *     responses:
 *       200:
 *         description: ดึงรายการที่พักทั้งหมดสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Get Homestays List Success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: "โฮมสเตย์บ้านสวนริมคลอง"
 *                       type:
 *                         type: string
 *                         example: "บ้านพักเดี่ยว"
 *                       facility:
 *                         type: string
 *                         example: "Wi-Fi, ที่จอดรถ, เครื่องปรับอากาศ"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalCount:
 *                       type: integer
 *                       example: 25
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: communityId ไม่ถูกต้อง หรือข้อมูลไม่ครบถ้วน
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ SuperAdmin)
 *       404:
 *         description: ไม่พบชุมชนหรือไม่มีข้อมูลที่พักในระบบ
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

homestayRoutes.get(
  "/super/community/:communityId/homestays",
  validateDto(getHomestaysAllDto),
  authMiddleware,
  allowRoles("superadmin"),
  getHomestaysAll
);

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

/**
 * @swagger
 * /api/admin/community/homestay/{homestayId}:
 *   get:
 *     summary: ดึงรายละเอียดของโฮมสเตย์ (Homestay) ในชุมชนของแอดมิน
 *     description: |
 *       ใช้สำหรับดึงข้อมูลรายละเอียดของโฮมสเตย์ (Homestay) ภายในชุมชน  
 *       ที่ผู้ดูแล (Admin) รับผิดชอบอยู่ โดยต้องระบุ `homestayId` ที่ต้องการค้นหา  
 *       ข้อมูลที่ได้จะรวมรายละเอียดของที่พัก, ภาพประกอบ, สิ่งอำนวยความสะดวก และเจ้าของที่พัก
 *     tags:
 *       - Homestay (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homestayId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *         description: รหัสของโฮมสเตย์ที่ต้องการดึงรายละเอียด
 *     responses:
 *       200:
 *         description: ดึงรายละเอียดของโฮมสเตย์สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Homestay detail retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     name:
 *                       type: string
 *                       example: "โฮมสเตย์บ้านสวนริมคลอง"
 *                     description:
 *                       type: string
 *                       example: "ที่พักบรรยากาศร่มรื่น ติดคลอง วิวธรรมชาติ"
 *                     type:
 *                       type: string
 *                       example: "บ้านพักเดี่ยว"
 *                     price:
 *                       type: number
 *                       example: 1200
 *                     maxGuest:
 *                       type: integer
 *                       example: 4
 *                     facility:
 *                       type: string
 *                       example: "Wi-Fi, เครื่องปรับอากาศ, อาหารเช้า"
 *                     community:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         name:
 *                           type: string
 *                           example: "ชุมชนบ้านคลองตะเคียน"
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 18
 *                         fname:
 *                           type: string
 *                           example: "สมหมาย"
 *                         lname:
 *                           type: string
 *                           example: "ใจดี"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           image:
 *                             type: string
 *                             example: "uploads/homestay/homestay-5-cover.jpg"
 *                           type:
 *                             type: string
 *                             enum: [COVER, GALLERY]
 *                             example: "COVER"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-15T09:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-10T10:45:00.000Z"
 *       400:
 *         description: รหัส homestayId ไม่ถูกต้อง หรือไม่พบข้อมูล
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ Admin)
 *       404:
 *         description: ไม่พบโฮมสเตย์ในระบบ
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

homestayRoutes.get(
  "/admin/community/homestay/:homestayId",
  authMiddleware,
  allowRoles("admin"),
  getHomestayDetail
);
export default homestayRoutes;
