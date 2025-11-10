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
 * @swagger
 * /api/super/community/{communityId}/homestay:
 *   post:
 *     tags: [Homestay - SuperAdmin]
 *     summary: สร้าง Homestay (สำหรับ Super Admin)
 *     description: >
 *       สร้างข้อมูล Homestay แบบ **single item** สำหรับชุมชนที่กำหนด  
 *       **ต้องส่งแบบ `multipart/form-data`** โดยมีไฟล์ `cover` (ได้ 1 ไฟล์) และ `gallery` (ได้สูงสุด 10 ไฟล์)  
 *       ฟิลด์ข้อมูลหลักอยู่ในคีย์ `data` (เป็นสตริง JSON ของ *HomestayDto*).  
 *       ต้องยืนยันตัวตนด้วย **JWT Bearer** และสิทธิ์ **superadmin**.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสชุมชนที่ต้องการสร้าง Homestay ให้
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string ของข้อมูลตามสคีมา **HomestayDto**
 *                 example: |
 *                   {
 *                     "name": "บ้านสวนริมน้ำ",
 *                     "description": "โฮมสเตย์บรรยากาศชุมชน วิวแม่น้ำ",
 *                     "price": 1200,
 *                     "capacity": 4,
 *                     "phone": "0812345678",
 *                     "address": "99/1 หมู่ 2",
 *                     "province": "ชลบุรี",
 *                     "district": "เมืองชลบุรี",
 *                     "subdistrict": "บ้านสวน",
 *                     "postalCode": "20000",
 *                     "latitude": 13.123456,
 *                     "longitude": 100.123456,
 *                     "facility": ["ที่จอดรถ","อาหารเช้า"]
 *                   }
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์รูปภาพหน้าปก (สูงสุด 1 ไฟล์)
 *               gallery:
 *                 type: array
 *                 description: ไฟล์รูปภาพแกลเลอรี (สูงสุด 10 ไฟล์)
 *                 items:
 *                   type: string
 *                   format: binary
 *             required: [data]
 *     responses:
 *       201:
 *         description: สร้าง Homestay สำเร็จ (รูปแบบตาม `createResponse`)
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
 *                   example: "สร้าง Homestay สำเร็จ"
 *                 data:
 *                   type: object
 *                   description: ข้อมูล Homestay ที่ถูกสร้าง
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *                     name:
 *                       type: string
 *                       example: "บ้านสวนริมน้ำ"
 *                     price:
 *                       type: number
 *                       example: 1200
 *                     capacity:
 *                       type: integer
 *                       example: 4
 *                     coverUrl:
 *                       type: string
 *                       example: "https://cdn.example.com/homestays/101/cover.jpg"
 *                     galleryUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - "https://cdn.example.com/homestays/101/1.jpg"
 *                         - "https://cdn.example.com/homestays/101/2.jpg"
 *       400:
 *         description: คำขอไม่ถูกต้อง/ตรวจสอบข้อมูลไม่ผ่าน (รูปแบบตาม `createErrorResponse`)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 message: { type: string, example: "ข้อมูลไม่ถูกต้อง" }
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field: { type: string, example: "name" }
 *                       message: { type: string, example: "ต้องระบุชื่อ" }
 *       401:
 *         description: ไม่ได้ยืนยันตัวตนหรือโทเค็นไม่ถูกต้อง (Bearer JWT)
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็นบทบาท superadmin)
 *       415:
 *         description: รูปแบบสื่อไม่รองรับ (ต้องเป็น multipart/form-data)
 *       500:
 *         description: ข้อผิดพลาดฝั่งเซิร์ฟเวอร์
 */

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

/**
 * @swagger
 * /api/super/homestay/edit/{homestayId}:
 *   put:
 *     tags:
 *       - Homestay - SuperAdmin
 *     summary: แก้ไข Homestay (สำหรับ Super Admin)
 *     description: |
 *       อัปเดตข้อมูล Homestay ที่ระบุด้วย homestayId
 *       ต้องส่งแบบ multipart/form-data โดยฟิลด์ข้อมูลหลักอยู่ในคีย์ `data` (JSON string)
 *       แนบไฟล์ได้เลือกส่ง ได้แก่ `cover` (สูงสุด 1) และ `gallery` (สูงสุด 10)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homestayId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัส Homestay ที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string ของข้อมูลที่จะอัปเดต
 *                 example: |
 *                   {
 *                     "name": "บ้านสวนริมน้ำ (อัปเดต)",
 *                     "price": 1500,
 *                     "capacity": 5,
 *                     "phone": "0899998888",
 *                     "facility": ["ที่จอดรถ", "อาหารเช้า", "ไวไฟ"]
 *                   }
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์รูปหน้าปกใหม่ (ถ้าต้องการเปลี่ยน)
 *               gallery:
 *                 type: array
 *                 description: ไฟล์รูปแกลเลอรีใหม่ (ถ้าต้องการเพิ่ม/แทนที่)
 *                 items:
 *                   type: string
 *                   format: binary
 *             required:
 *               - data
 *     responses:
 *       200:
 *         description: แก้ไข Homestay สำเร็จ (createResponse)
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
 *                   example: อัปเดต Homestay สำเร็จ
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *                     name:
 *                       type: string
 *                       example: บ้านสวนริมน้ำ (อัปเดต)
 *                     price:
 *                       type: number
 *                       example: 1500
 *                     capacity:
 *                       type: integer
 *                       example: 5
 *                     coverUrl:
 *                       type: string
 *                       example: https://cdn.example.com/homestays/101/cover.jpg
 *                     galleryUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: คำขอไม่ถูกต้อง/ตรวจสอบข้อมูลไม่ผ่าน (createErrorResponse)
 *       401:
 *         description: ไม่ได้ยืนยันตัวตนหรือโทเค็นไม่ถูกต้อง
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น superadmin)
 *       415:
 *         description: รูปแบบสื่อไม่รองรับ (ต้องเป็น multipart/form-data)
 *       500:
 *         description: ข้อผิดพลาดฝั่งเซิร์ฟเวอร์
 */


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

homestayRoutes.get(
  "/admin/community/homestays/all",
  authMiddleware,
  allowRoles("admin"),
  getHomestaysAllAdmin
);

/**
 * @swagger
 * /api/admin/community/homestay:
 *   post:
 *     tags: [Homestay - Admin]
 *     summary: สร้าง Homestay (สำหรับ Admin)
 *     description: >
 *       สร้าง Homestay ใหม่ในชุมชนของผู้ดูแล (admin)  
 *       **ต้องส่งแบบ `multipart/form-data`** โดยข้อมูลหลักอยู่ในคีย์ `data` (สตริง JSON ตามสคีมา *HomestayDto* หรือเทียบเท่า)  
 *       แนบไฟล์ได้ ได้แก่ `cover` (สูงสุด 1 ไฟล์) และ `gallery` (สูงสุด 5 ไฟล์).  
 *       ต้องยืนยันตัวตนด้วย **JWT Bearer** และสิทธิ์ **admin**.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string ของข้อมูล Homestay
 *                 example: |
 *                   {
 *                     "name": "โฮมสเตย์กลางทุ่ง",
 *                     "description": "พักผ่อนกลางธรรมชาติ",
 *                     "price": 900,
 *                     "capacity": 3,
 *                     "phone": "0801234567",
 *                     "address": "12/3 หมู่ 7",
 *                     "province": "เชียงใหม่",
 *                     "district": "สันทราย",
 *                     "subdistrict": "สันทรายน้อย",
 *                     "postalCode": "50210",
 *                     "latitude": 18.81234,
 *                     "longitude": 99.01234,
 *                     "facility": ["จักรยาน", "อาหารเช้า"]
 *                   }
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์รูปภาพหน้าปก (สูงสุด 1 ไฟล์)
 *               gallery:
 *                 type: array
 *                 description: ไฟล์รูปภาพแกลเลอรี (สูงสุด 5 ไฟล์)
 *                 items:
 *                   type: string
 *                   format: binary
 *             required: [data]
 *     responses:
 *       201:
 *         description: สร้าง Homestay สำเร็จ (รูปแบบตาม `createResponse`)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "สร้าง Homestay สำเร็จ" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 205 }
 *                     name: { type: string, example: "โฮมสเตย์กลางทุ่ง" }
 *                     price: { type: number, example: 900 }
 *                     capacity: { type: integer, example: 3 }
 *                     coverUrl: { type: string, example: "https://cdn.example.com/homestays/205/cover.jpg" }
 *                     galleryUrls:
 *                       type: array
 *                       items: { type: string }
 *       400:
 *         description: คำขอไม่ถูกต้อง/ตรวจสอบข้อมูลไม่ผ่าน (ตาม `createErrorResponse`)
 *       401:
 *         description: ไม่ได้ยืนยันตัวตนหรือโทเค็นไม่ถูกต้อง (Bearer JWT)
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็นบทบาท admin)
 *       415:
 *         description: รูปแบบสื่อไม่รองรับ (ต้องเป็น multipart/form-data)
 *       500:
 *         description: ข้อผิดพลาดฝั่งเซิร์ฟเวอร์
 */

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

/**
 * @swagger
 * /api/admin/community/homestay/edit/{homestayId}:
 *   put:
 *     tags: [Homestay - Admin]
 *     summary: แก้ไข Homestay (สำหรับ Admin)
 *     description: >
 *       อัปเดตข้อมูล Homestay ของชุมชนภายใต้ความรับผิดชอบของแอดมิน  
 *       ต้องส่งแบบ `multipart/form-data` โดยมี `data` เป็น JSON string ของข้อมูลที่จะอัปเดต  
 *       แนบไฟล์ได้: `cover` (≤1) และ `gallery` (≤5)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homestayId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัส Homestay ที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string ของฟิลด์ที่จะอัปเดต (เช่น name, price, capacity, facility ฯลฯ)
 *                 example: |
 *                   {
 *                     "price": 1000,
 *                     "capacity": 4,
 *                     "facility": ["อาหารเช้า","ไวไฟ"]
 *                   }
 *               cover:
 *                 type: string
 *                 format: binary
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             required: [data]
 *     responses:
 *       200:
 *         description: สำเร็จ (createResponse)
 *       400:
 *         description: ตรวจสอบไม่ผ่าน (createErrorResponse)
 *       401:
 *         description: ไม่ได้ยืนยันตัวตน (ต้องส่ง Bearer JWT)
 *       403:
 *         description: ไม่มีสิทธิ์ (ต้องเป็น admin)
 *       415:
 *         description: ต้องเป็น multipart/form-data
 *       500:
 *         description: ข้อผิดพลาดฝั่งเซิร์ฟเวอร์
 */

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
