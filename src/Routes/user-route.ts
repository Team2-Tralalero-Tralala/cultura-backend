/*
 * คำอธิบาย : Router สำหรับจัดการเส้นทาง (Route) ของข้อมูลบัญชีผู้ใช้ (User)
 * ใช้สำหรับเชื่อมโยงเส้นทาง API เข้ากับ Controller ที่เกี่ยวข้องกับการจัดการบัญชี
 * โดยรองรับการทำงานของ SuperAdmin และ Admin
 *
 * ฟังก์ชันหลักที่รองรับ :
 *   - อัปโหลดรูปโปรไฟล์ผู้ใช้
 *   - ดึงข้อมูลผู้ใช้ทั้งหมด / ตามสถานะ / ตาม ID
 *   - สร้างบัญชีใหม่ / บล็อก / ปลดบล็อก / ลบผู้ใช้
 *
 * Middleware ที่ใช้ :
 *   - authMiddleware : ตรวจสอบสิทธิ์การเข้าสู่ระบบ
 *   - allowRoles : จำกัดสิทธิ์เฉพาะบทบาทที่กำหนด (SuperAdmin, Admin)
 *   - upload.single / compressUploadedFile : สำหรับอัปโหลดและบีบอัดไฟล์รูปภาพ
 */

import { Router } from "express";
import * as UserController from "~/Controllers/user-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import { compressUploadedFile } from "../Middlewares/upload-middleware.js";
import { upload } from "../Libs/uploadFile.js";
import { resetPassword } from "~/Services/user/user-service.js";

const userRoutes = Router();

/*
 * เส้นทาง : POST /
 * คำอธิบาย : ทดสอบ API สำหรับสร้างบัญชีใหม่พร้อมอัปโหลดรูปภาพ
 * สิทธิ์ที่เข้าถึงได้ : ทุกคน (ใช้เพื่อทดสอบ)
 */
userRoutes.post(
  "/",
  upload.single("profileImage"),
  compressUploadedFile,
  validateDto(UserController.createAccountDto),
  UserController.createAccount
);

/*
 * เส้นทาง : PUT /super/users/profile/:userId
 * คำอธิบาย : อัปโหลดรูปโปรไฟล์ของผู้ใช้ (เฉพาะ SuperAdmin)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
userRoutes.put(
  "/super/users/profile/:userId",
  authMiddleware,
  allowRoles("superadmin"),
  upload.single("profileImage"),
  compressUploadedFile,
  UserController.updateProfileImage
);

/*
 * เส้นทาง : PUT /admin/member/profile/:userId
 * คำอธิบาย : อัปโหลดรูปโปรไฟล์ของสมาชิก (เฉพาะ Admin)
 * สิทธิ์ที่เข้าถึงได้ : Admin
 */
userRoutes.put(
  "/admin/member/profile/:userId",
  authMiddleware,
  allowRoles("admin"),
  upload.single("profileImage"),
  compressUploadedFile,
  UserController.updateProfileImage
);

/**
 * @swagger
 * /api/super/accounts:
 *   get:
 *     summary: ดึงรายการบัญชีผู้ใช้งานทั้งหมด (Super Admin)
 *     description: |
 *       ใช้สำหรับดึงรายการบัญชีผู้ใช้งานทั้งหมดในระบบ
 *       ต้องเป็น **SuperAdmin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *       รองรับการค้นหา (Search) และแบ่งหน้า (Pagination)
 *     tags:
 *       - SuperAdmin / Account
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "john"
 *         description: คำค้นหาชื่อหรืออีเมล
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           example: "member"
 *         description: กรองตาม Role
 *     responses:
 *       200:
 *         description: สำเร็จ - คืนข้อมูลบัญชีทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_UserAccountList'
 *       400:
 *         description: คำขอไม่ถูกต้อง (Invalid Request)
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
 * เส้นทาง : GET /super/accounts
 * คำอธิบาย : ดึงบัญชีผู้ใช้ทั้งหมด (รองรับ search / filterRole / pagination)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
userRoutes.get(
  "/super/accounts",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(UserController.getAccountsDto),
  UserController.getAccountAll
);

/**
 * @swagger
 * /api/super/accounts/{status}:
 *   get:
 *     summary: ดึงรายการบัญชีผู้ใช้งานตามสถานะ (Super Admin)
 *     description: |
 *       ใช้สำหรับดึงข้อมูลบัญชีผู้ใช้งานทั้งหมดตามสถานะที่ระบุ
 *       ต้องเป็น **SuperAdmin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *       รองรับการแบ่งหน้า (Pagination)
 *     tags:
 *       - SuperAdmin / Account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ACTIVE, BLOCKED, EXPIRED]
 *           example: BLOCKED
 *         description: สถานะของบัญชีผู้ใช้
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
 *         description: สำเร็จ - คืนข้อมูลบัญชีผู้ใช้งานตามสถานะที่ระบุ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_UserAccountList'
 *       400:
 *         description: คำขอไม่ถูกต้อง (Invalid Request)
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
 * เส้นทาง : GET /super/accounts/:status
 * คำอธิบาย : ดึงบัญชีผู้ใช้ตามสถานะ (ACTIVE / BLOCKED)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
userRoutes.get(
  "/super/accounts/:status",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(UserController.getUserByStatusDto),
  UserController.getUserByStatus
);

/**
 * @swagger
 * /api/super/users/{userId}:
 *   get:
 *     summary: ดึงรายละเอียดของผู้ใช้ (SuperAdmin)
 *     description: |
 *       ใช้สำหรับดึงข้อมูลรายละเอียดของผู้ใช้ตาม userId
 *       ต้องเป็น **SuperAdmin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - SuperAdmin / User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: รหัสผู้ใช้ (User ID)
 *     responses:
 *       200:
 *         description: สำเร็จ - คืนข้อมูลรายละเอียดของผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_UserAccountList'
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
 * เส้นทาง : GET /super/users/:userId
 * คำอธิบาย : ดึงข้อมูลรายละเอียดของผู้ใช้ตาม userId (เฉพาะ SuperAdmin)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
userRoutes.get(
  "/super/users/:userId",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(UserController.getUserByIdDto),
  UserController.getUserById
);

/**
 * @swagger
 * /api/admin/member/{userId}:
 *   get:
 *     summary: ดึงรายละเอียดของสมาชิกในชุมชน (Admin)
 *     description: |
 *       ใช้สำหรับดึงรายละเอียดของสมาชิกในชุมชนที่ Admin ดูแลอยู่
 *       ต้องเป็น **Admin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - Admin / Member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: รหัสสมาชิกที่ต้องการดู
 *     responses:
 *       200:
 *         description: สำเร็จ - คืนข้อมูลรายละเอียดสมาชิก
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_UserAccountList'
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
 * เส้นทาง : GET /admin/member/:userId
 * คำอธิบาย : ดึงรายละเอียดของสมาชิกในชุมชนที่ Admin ดูแลอยู่
 * สิทธิ์ที่เข้าถึงได้ : Admin
 */
userRoutes.get(
  "/admin/member/:userId",
  authMiddleware,
  allowRoles("admin"),
  validateDto(UserController.getUserByIdDto),
  UserController.getMemberByAdmin
);

/**
 * @swagger
 * /api/super/users/{userId}:
 *   patch:
 *     summary: ลบบัญชีผู้ใช้แบบ Soft Delete (SuperAdmin)
 *     description: |
 *       ใช้สำหรับลบบัญชีผู้ใช้โดยไม่ลบข้อมูลออกจากฐานข้อมูลจริง (Soft Delete)
 *       ต้องเป็น **SuperAdmin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - SuperAdmin / User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: รหัสผู้ใช้ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: สำเร็จ - ลบบัญชีผู้ใช้เรียบร้อย
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
 * เส้นทาง : PATCH /super/users/:userId
 * คำอธิบาย : ลบบัญชีผู้ใช้แบบ Soft Delete
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
userRoutes.patch(
  "/super/users/:userId",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(UserController.deleteAccountByIdDto),
  UserController.deleteAccountById
);

/**
 * @swagger
 * /api/super/users/block/{userId}:
 *   put:
 *     summary: ระงับบัญชีผู้ใช้ (SuperAdmin)
 *     description: |
 *       ใช้สำหรับระงับบัญชีผู้ใช้ที่กำหนดตาม userId
 *       ต้องเป็น **SuperAdmin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - SuperAdmin / User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: รหัสผู้ใช้ที่ต้องการระงับ
 *     responses:
 *       200:
 *         description: สำเร็จ - บัญชีถูกระงับเรียบร้อย
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
 * เส้นทาง : PUT /super/users/block/:userId
 * คำอธิบาย : ระงับบัญชีผู้ใช้ (Block)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
userRoutes.put(
  "/super/users/block/:userId",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(UserController.blockAccountByIdDto),
  UserController.blockAccountById
);

/**
 * @swagger
 * /api/super/users/unblock/{userId}:
 *   put:
 *     summary: ปลดการระงับบัญชีผู้ใช้ (SuperAdmin)
 *     description: |
 *       ใช้สำหรับปลดสถานะระงับของบัญชีผู้ใช้ตาม userId
 *       ต้องเป็น **SuperAdmin** เท่านั้น และต้องแนบ JWT Token ใน Header
 *     tags:
 *       - SuperAdmin / User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: รหัสผู้ใช้ที่ต้องการปลดระงับ
 *     responses:
 *       200:
 *         description: สำเร็จ - ปลดการระงับบัญชีเรียบร้อย
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
 * เส้นทาง : PUT /super/users/unblock/:userId
 * คำอธิบาย : ปลดการระงับบัญชีผู้ใช้ (Unblock)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
userRoutes.put(
  "/super/users/unblock/:userId",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(UserController.unblockAccountByIdDto),
  UserController.unblockAccountById
);

/**
 * คำอธิบาย : สำหรับให้ Super Admin รีเซ็ตรหัสผ่านของผู้ใช้ตามรหัส userId ที่กำหนด
 */
/**
 * @swagger
 * /api/super/account/{userId}/reset-password:
 *   patch:
 *     summary: รีเซ็ตรหัสผ่านของผู้ใช้ (เฉพาะ Super Admin)
 *     description: Super Admin สามารถรีเซ็ตรหัสผ่านใหม่ให้ผู้ใช้ที่กำหนด โดยต้องระบุ userId ผ่าน path parameter และส่งข้อมูลรหัสผ่านใหม่ใน body
 *     tags:
 *       - Super - Account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: รหัส ID ของผู้ใช้ที่ต้องการรีเซ็ตรหัสผ่าน
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 maxLength: 80
 *                 description: รหัสผ่านใหม่ของผู้ใช้ (ต้องไม่เกิน 80 ตัวอักษร)
 *                 example: "NewP@ssword123"
 *     responses:
 *       200:
 *         description: รีเซ็ตรหัสผ่านสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: "Reset new password successfully"
 *               data:
 *                 id: 1
 *                 email: "super@demo.com"
 *                 role:
 *                   id: 1
 *                   name: "superadmin"
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง (Validation Error)
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "Validation Error!"
 *               errorId: "7896c1d3-8985-460c-8caf-5746fe9f085d"
 *               errors:
 *                 newPassword:
 *                   - "รหัสผ่านต้องไม่เกิน 80 ตัวอักษร"
 *                   - "รหัสผ่านห้ามว่าง"
 *                   - "รหัสผ่านต้องเป็นข้อความ"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (token ไม่ถูกต้อง)
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 *       403:
 *         description: ไม่มีสิทธิ์ดำเนินการ (เฉพาะ superadmin เท่านั้น)
 *         content:
 *           application/json:
 *             example:
 *               status: 403
 *               error: true
 *               message: "Forbidden"
 *       404:
 *         description: ไม่พบบัญชีผู้ใช้ตาม userId
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               error: true
 *               message: "User not found"
 */
userRoutes.patch(
  "/super/account/:userId/reset-password",
  validateDto(UserController.resetPasswordDto),
  authMiddleware,
  allowRoles("superadmin"),
  UserController.resetPassword
);
userRoutes.patch(
  "/super/account/:userId/reset-password",
  validateDto(UserController.resetPasswordDto),
  authMiddleware,
  allowRoles("superadmin"),
  UserController.resetPassword
);

/**
 * @swagger
 * /api/account/change-password/me:
 *   post:
 *     tags:
 *       - Account
 *     summary: Change password for current user
 *     description: |
 *       เปลี่ยนรหัสผ่านของผู้ใช้ที่ล็อกอินอยู่ (**me**) โดยต้องส่งรหัสผ่านเดิมและรหัสผ่านใหม่
 *       รองรับ role: `superadmin`, `admin`, `member`, `tourist`
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: รหัสผ่านเดิมของผู้ใช้
 *               newPassword:
 *                 type: string
 *                 description: รหัสผ่านใหม่
 *               confirmNewPassword:
 *                 type: string
 *                 description: ยืนยันรหัสผ่านใหม่ ต้องตรงกับ newPassword
 *           example:
 *             currentPassword: "OldP@ssw0rd"
 *             newPassword: "NewP@ssw0rd123"
 *             confirmNewPassword: "NewP@ssw0rd123"
 *     responses:
 *       200:
 *         description: เปลี่ยนรหัสผ่านสำเร็จ (createResponse)
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
 *                   example: Change password successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: ผลลัพธ์จาก UserService.changePassword
 *                 meta:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Validation Error หรือข้อมูลไม่ถูกต้อง (createErrorResponse)
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
 *                   example: Validation Error!
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 meta:
 *                   type: object
 *                   nullable: true
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: ไม่ได้ล็อกอินหรือ token ไม่ถูกต้อง (authMiddleware)
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
 *         description: ไม่มีสิทธิ์เรียกใช้ endpoint นี้ (allowRoles)
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
 *                   example: Forbidden
 *       404:
 *         description: ไม่พบผู้ใช้หรือเปลี่ยนรหัสผ่านไม่สำเร็จ (createErrorResponse)
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
 *                   example: User not found or change password failed
 */

/*
 * เส้นทาง : /account/change-password/me
 * คำอธิบาย : เปลี่ยนรหัสผ่านบัยชี
 * สิทธิ์ที่เข้าถึงได้ : "superadmin", "admin", "member", "tourist"
 */

userRoutes.post(
  "/shared/account/change-password/me",
  authMiddleware,
  allowRoles("superadmin", "admin", "member", "tourist"),
  validateDto(UserController.changePasswordDto),
  UserController.changePassword
);

/**
 * @swagger
 * /api/admin/member/{userId}:
 *   patch:
 *     tags:
 *       - Admin - Members
 *     summary: ลบสมาชิกชุมชนตามรหัส ID
 *     description: >
 *       ลบสมาชิกชุมชนตามรหัส ID ที่ส่งมาใน path parameter
 *       **ต้องเป็นผู้ใช้ที่ผ่านการยืนยันตัวตนและมีสิทธิ์ role: admin**
 *       สำเร็จจะคืนข้อมูลสมาชิกที่ถูกลบ, ถ้าไม่พบจะคืน 404
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: รหัสสมาชิกชุมชน (User ID) ที่ต้องการลบ
 *         schema:
 *           type: integer
 *           example: 7
 *     responses:
 *       200:
 *         description: ลบสมาชิกชุมชนสำเร็จ
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
 *                   example: Deleted community member successfully
 *                 data:
 *                   type: object
 *                   description: ข้อมูลสมาชิกชุมชนที่ถูกลบ
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 7
 *       404:
 *         description: ไม่พบสมาชิกชุมชนตามรหัสที่ระบุ
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
 *                   example: Community member not found
 */

/*
 * เส้นทาง : PATCH /admin/member/:userId
 * คำอธิบาย : ลบ member ออกจาก Community แบบ Soft Delete
 * สิทธิ์ที่เข้าถึงได้ : admin
 */
userRoutes.patch(
  "/admin/member/:userId",
  authMiddleware,
  allowRoles("admin"),
  validateDto(UserController.deleteCommunityMemberByIdDto),
  UserController.deleteCommunityMemberById
);

//  ดึงบัญชีผู้ใช้ทั้งหมด role Admin (พร้อม search / filterRole / pagination)
userRoutes.get(
  "/admin/accounts",
  authMiddleware, // ตรวจสอบ token ก่อน
  allowRoles("admin"), // ตรวจสอบสิทธิ์
  validateDto(UserController.getAccountsDto), // ตรวจสอบ query parameters
  UserController.getAccountAll
);

export default userRoutes;
