import { Router } from "express";
import * as userController from "../Controllers/user-controller.js";
import * as validateDto from "~/Libs/validateDto.js";
import * as authMiddleware from "~/Middlewares/auth-middleware.js";
import * as compressUpload from "../Middlewares/upload-middleware.js";
import * as upload from "../Libs/uploadFile.js";

const userRoutes = Router();

//เทส API ใช้ฟังก์ชันบีบไฟล์
userRoutes.post(
    "/",
    upload.upload.single("profileImage"),
    compressUpload.compressUploadedFile,
    validateDto.validateDto(userController.createAccountDto),
    userController.createAccount
); 

//เทส API ใช้ฟังก์ชันบีบไฟล์
userRoutes.post(
    "/",
    upload.upload.single("profileImage"),
    compressUpload.compressUploadedFile,
    validateDto.validateDto(userController.createAccountDto),
    userController.createAccount
); 

/* ==========================================================
 *  Super Admin / Admin : จัดการบัญชีผู้ใช้ทั้งหมด
 * ========================================================== */

//  ดึงบัญชีผู้ใช้ทั้งหมด (พร้อม search / filterRole / pagination)
userRoutes.get(
  "/super/accounts",
  authMiddleware.authMiddleware,                     // ตรวจสอบ token ก่อน
  authMiddleware.allowRoles("superadmin", "admin"),  // ตรวจสอบสิทธิ์
  validateDto.validateDto(userController.getAccountsDto),        // ตรวจสอบ query parameters
  userController.getAccountAll
);

//  ดึงบัญชีผู้ใช้ทั้งหมด role Admin (พร้อม search / filterRole / pagination)
userRoutes.get(
    "/admin/accounts",
    authMiddleware.authMiddleware,                     // ตรวจสอบ token ก่อน
    authMiddleware.allowRoles("admin"),                // ตรวจสอบสิทธิ์
    validateDto.validateDto(userController.getAccountsDto),        // ตรวจสอบ query parameters
    userController.getAccountAll
);

//  ดึงบัญชีผู้ใช้ตามสถานะ (ACTIVE / BLOCKED) + searchName
userRoutes.get(
  "/super/accounts/status/:status",
  authMiddleware.authMiddleware,
  authMiddleware.allowRoles("superadmin", "admin"),
  validateDto.validateDto(userController.getUserByStatusDto),
  userController.getUserByStatus
);

/* ==========================================================
 *  Super Admin / Admin / Member : ดูข้อมูลผู้ใช้เฉพาะคน
 * ========================================================== */

userRoutes.get(
  "/super/users/:userId",
  authMiddleware.authMiddleware,
  authMiddleware.allowRoles("superadmin", "admin"),
  validateDto.validateDto(userController.getUserByIdDto),
  userController.getUserById
);

/* ==========================================================
 *  Super Admin / Admin : ลบ / บล็อก / ปลดบล็อก
 * ========================================================== */

// ลบบัญชีผู้ใช้
userRoutes.patch(
  "/super/users/:userId",
  authMiddleware.authMiddleware,
  authMiddleware.allowRoles("superadmin", "admin"),
  validateDto.validateDto(userController.deleteAccountByIdDto),
  userController.deleteAccountById
);

// บล็อกบัญชีผู้ใช้
userRoutes.put(
  "/super/users/block/:userId",
  authMiddleware.authMiddleware,
  authMiddleware.allowRoles("superadmin", "admin"),
  validateDto.validateDto(userController.blockAccountByIdDto),
  userController.blockAccountById
);

// ปลดบล็อกบัญชีผู้ใช้
userRoutes.put(
  "/super/users/unblock/:userId",
  authMiddleware.authMiddleware,
  authMiddleware.allowRoles("superadmin", "admin"),
  validateDto.validateDto(userController.unblockAccountByIdDto),
  userController.unblockAccountById
);

export default userRoutes;
