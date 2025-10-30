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

export default userRoutes;
