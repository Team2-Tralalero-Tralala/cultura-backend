import { Router } from "express";
import * as authMiddleware from "../Middlewares/auth-middleware.js";
import * as upload from "~/Libs/uploadFile.js";
import * as compressUploadedFile from "~/Middlewares/upload-middleware.js";
import * as bannerController from "../Controllers/banner-controller.js";

const bannerRoutes = Router();

/**
 * @swagger
 * /api/super/banner/:
 *   get:
 *     tags:
 *       - Super - Banner
 *     summary: Get all banners
 *     description: |
 *       ดึงรายการแบนเนอร์ทั้งหมด (Banner List)  
 *       ต้องเป็นผู้ใช้ที่มีสิทธิ์ **superadmin** เท่านั้น  
 *       ทุกคำตอบถูกห่อด้วยโครงสร้างมาตรฐาน `createResponse` / `createErrorResponse`
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงรายการ Banner สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Get banner successfully
 *                 data:
 *                   type: array
 *                   description: รายการแบนเนอร์ที่ระบบมีอยู่
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       order:
 *                         type: integer
 *                         description: ลำดับการแสดงผล
 *                         example: 1
 *                       key:
 *                         type: string
 *                         description: ชื่อไฟล์/คีย์ที่เก็บในระบบ
 *                         example: "banner_1717401122334.jpg"
 *                       path:
 *                         type: string
 *                         description: พาธไฟล์ในเซิร์ฟเวอร์ หรือ URL เข้าถึงไฟล์
 *                         example: "uploads/banners/banner_1717401122334.jpg"
 *                 meta:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: ไม่ได้ส่ง JWT Bearer token หรือ token ไม่ถูกต้อง (Unauthorized - authMiddleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       403:
 *         description: Forbidden – ผู้ใช้ไม่มีสิทธิ์ superadmin (allowRoles)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Forbidden resource
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * คำอธิบาย : route ดึงรูปภาพ banner
 */
bannerRoutes.get(
    "/",
    authMiddleware.authMiddleware,
    authMiddleware.allowRoles("superadmin"),
    bannerController.getBanner
);

/**
 * @swagger
 * /api/super/banner/:
 *   post:
 *     tags:
 *       - Super - Banner
 *     summary: Upload banner images
 *     description: |
 *       อัปโหลดรูปภาพ Banner ใหม่ (สูงสุด 5 รูป)  
 *       ใช้ได้เฉพาะผู้ใช้ที่มีสิทธิ์ **superadmin** เท่านั้น  
 *       คำตอบทั้งหมดถูกห่อด้วยโครงสร้างมาตรฐาน `createResponse` / `createErrorResponse`.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - banner
 *             properties:
 *               banner:
 *                 type: array
 *                 description: ไฟล์รูป Banner ที่ต้องการอัปโหลด (field name = "banner", สูงสุด 5 ไฟล์)
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: อัปโหลด Banner สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Add banner successfully
 *                 data:
 *                   type: array
 *                   description: รายการ Banner ที่ถูกสร้างสำเร็จ
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: รหัส Banner
 *                         example: 1
 *                       order:
 *                         type: integer
 *                         description: ลำดับการแสดงผล
 *                         example: 1
 *                       key:
 *                         type: string
 *                         description: ชื่อไฟล์/คีย์ที่เก็บในระบบ
 *                         example: "banner_1717401122334.jpg"
 *                       originalName:
 *                         type: string
 *                         description: ชื่อไฟล์ต้นฉบับ
 *                         example: "home_banner.jpg"
 *                       mime:
 *                         type: string
 *                         description: MIME type ของไฟล์
 *                         example: "image/jpeg"
 *                       size:
 *                         type: integer
 *                         description: ขนาดไฟล์ (byte)
 *                         example: 245678
 *                       path:
 *                         type: string
 *                         description: พาธไฟล์ในเซิร์ฟเวอร์หรือ URL เข้าถึงไฟล์
 *                         example: "uploads/banners/banner_1717401122334.jpg"
 *                 meta:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: คำขอไม่ถูกต้อง หรือไม่พบไฟล์อัปโหลด (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: file not found
 *                 errors:
 *                   type: object
 *                   nullable: true
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: ไม่ได้ส่ง JWT Bearer token หรือ token ไม่ถูกต้อง (Unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       403:
 *         description: Forbidden – ผู้ใช้ไม่มีสิทธิ์ superadmin (allowRoles)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Forbidden resource
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * คำอธิบาย : route สร้าง banner
 */
bannerRoutes.post(
    "/",
    authMiddleware.authMiddleware,
    authMiddleware.allowRoles("superadmin"),
    upload.upload.array("banner", 5),
    compressUploadedFile.compressUploadedFile,
    bannerController.addBanner
);

/**
 * @swagger
 * /api/super/banner/{id}:
 *   put:
 *     tags:
 *       - Super - Banner
 *     summary: Update banner by id
 *     description: |
 *       แก้ไขแบนเนอร์ตาม `id` (เช่น เปลี่ยนรูปภาพ)  
 *       ใช้ได้เฉพาะผู้ใช้ที่มีสิทธิ์ **superadmin**  
 *       ทุก response จะอยู่ในรูปแบบมาตรฐาน `createResponse` / `createErrorResponse`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสแบนเนอร์ที่ต้องการแก้ไข
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์รูปแบนเนอร์ใหม่ (field name = "banner")
 *     responses:
 *       200:
 *         description: แก้ไข Banner สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Edit banner successfully
 *                 data:
 *                   type: object
 *                   description: ข้อมูลแบนเนอร์หลังแก้ไขสำเร็จ
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     order:
 *                       type: integer
 *                       example: 1
 *                     key:
 *                       type: string
 *                       example: "banner_1717401122334.jpg"
 *                     path:
 *                       type: string
 *                       example: "uploads/banners/banner_1717401122334.jpg"
 *                 meta:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: คำขอไม่ถูกต้อง หรือไฟล์ไม่ถูกต้อง (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Bad request
 *                 errors:
 *                   type: object
 *                   nullable: true
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: ไม่ได้ส่ง JWT หรือ token ไม่ถูกต้อง (Unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       403:
 *         description: Forbidden – ผู้ใช้ไม่มีสิทธิ์ superadmin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Forbidden resource
 *       404:
 *         description: ไม่พบแบนเนอร์ตาม id ที่ระบุ (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Banner not found
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * คำอธิบาย : route แก้ไข banner
 */
bannerRoutes.put(
    "/:id",
    authMiddleware.authMiddleware,
    authMiddleware.allowRoles("superadmin"),
    upload.upload.single("banner"),
    compressUploadedFile.compressUploadedFile,
    bannerController.editBanner
);

/**
 * @swagger
 * /api/super/banner/{id}:
 *   delete:
 *     tags:
 *       - Super - Banner
 *     summary: Delete banner by id
 *     description: |
 *       ลบแบนเนอร์ตาม `id`  
 *       ใช้ได้เฉพาะผู้ใช้ที่มีสิทธิ์ **superadmin**  
 *       ทุก response จะอยู่ในรูปแบบมาตรฐาน `createResponse` / `createErrorResponse`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสแบนเนอร์ที่ต้องการลบ
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบ Banner สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Delete banner successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 meta:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: คำขอไม่ถูกต้อง (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Bad request
 *                 errors:
 *                   type: object
 *                   nullable: true
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: ไม่ได้ส่ง JWT หรือ token ไม่ถูกต้อง (Unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       403:
 *         description: Forbidden – ผู้ใช้ไม่มีสิทธิ์ superadmin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Forbidden resource
 *       404:
 *         description: ไม่พบแบนเนอร์ตาม id ที่ระบุ (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Banner not found
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * คำอธิบาย : route ลบรูปภาพ banner
 */
bannerRoutes.delete(
    "/:id",
    authMiddleware.authMiddleware,
    authMiddleware.allowRoles("superadmin"),
    compressUploadedFile.compressUploadedFile,
    bannerController.deleteBanner
);

export default bannerRoutes;