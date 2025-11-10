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

/** เส้นทาง API : PATCH /super/account/:userId/reset-password
 * คำอธิบาย : สำหรับให้ Super Admin รีเซ็ตรหัสผ่านของผู้ใช้ตามรหัส userId ที่กำหนด
 * Middleware :
 *   - validateDto(forgetPasswordDto) : ตรวจสอบความถูกต้องของข้อมูลที่ส่งมา (รหัสผ่านใหม่ต้องเป็นข้อความและไม่ว่าง)
 *   - authMiddleware : ตรวจสอบการยืนยันตัวตนของผู้ใช้ที่ส่งคำขอ
 *   - allowRoles("superadmin") : อนุญาตเฉพาะผู้ใช้ที่มีสิทธิ์ Super Admin เท่านั้น
 * Handler : forgetPassword — ทำการเข้ารหัสรหัสผ่านใหม่และอัปเดตลงฐานข้อมูล
 */
userRoutes.patch(
  "/super/account/:userId/reset-password",
  validateDto(UserController.resetPasswordDto),
  authMiddleware,
  allowRoles("superadmin"),
  UserController.resetPassword
);

userRoutes.post(
    "/account/change-password/me",
    authMiddleware,
    allowRoles("superadmin", "admin", "member", "tourist"),
    validateDto(UserController.changePasswordDto),
    UserController.changePassword
);

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

export default userRoutes;
