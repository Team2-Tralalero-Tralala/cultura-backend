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

/*
 * เส้นทาง : GET /super/accounts/status/:status
 * คำอธิบาย : ดึงบัญชีผู้ใช้ตามสถานะ (ACTIVE / BLOCKED)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
userRoutes.get(
  "/super/accounts/status/:status",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(UserController.getUserByStatusDto),
  UserController.getUserByStatus
);

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
