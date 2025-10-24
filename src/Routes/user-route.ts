import { Router } from "express";
import { 
    getAccountAll,
    getAccountsDto,
    getUserById,
    getUserByIdDto,
    getUserByStatus, 
    getUserByStatusDto,
    deleteAccountById,
    deleteAccountByIdDto,
    blockAccountById,
    blockAccountByIdDto,
    unblockAccountById,
    unblockAccountByIdDto,
    changePassword,
    changePasswordDto,
    createAccountDto,
    createAccount,
} from "../Controllers/user-controller.js";

import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import { compressUploadedFile } from "../Middlewares/upload-middleware.js";
import { upload } from "../Libs/uploadFile.js";

const userRoutes = Router();

//เทส API ใช้ฟังก์ชันบีบไฟล์
userRoutes.post(
    "/",
    upload.single("profileImage"),
    compressUploadedFile,
    validateDto(createAccountDto),
    createAccount
); 

userRoutes.post(
    "/account/change-password/me",
    authMiddleware,
    allowRoles("superadmin", "admin", "member", "tourist"),
    validateDto(changePasswordDto),
    changePassword
);
//เทส API ใช้ฟังก์ชันบีบไฟล์
userRoutes.post(
    "/",
    upload.single("profileImage"),
    compressUploadedFile,
    validateDto(createAccountDto),
    createAccount
); 

/* ==========================================================
 *  Super Admin / Admin : จัดการบัญชีผู้ใช้ทั้งหมด
 * ========================================================== */

//  ดึงบัญชีผู้ใช้ทั้งหมด (พร้อม search / filterRole / pagination)
userRoutes.get(
  "/super/accounts",
  authMiddleware,                     // ตรวจสอบ token ก่อน
  allowRoles("superadmin", "admin"),  // ตรวจสอบสิทธิ์
  validateDto(getAccountsDto),        // ตรวจสอบ query parameters
  getAccountAll
);

//  ดึงบัญชีผู้ใช้ตามสถานะ (ACTIVE / BLOCKED) + searchName
userRoutes.get(
  "/super/accounts/status/:status",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(getUserByStatusDto),
  getUserByStatus
);

/* ==========================================================
 *  Super Admin / Admin / Member : ดูข้อมูลผู้ใช้เฉพาะคน
 * ========================================================== */

userRoutes.get(
  "/super/users/:userId",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(getUserByIdDto),
  getUserById
);

/* ==========================================================
 *  Super Admin / Admin : ลบ / บล็อก / ปลดบล็อก
 * ========================================================== */

// ลบบัญชีผู้ใช้
userRoutes.patch(
  "/super/users/:userId",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(deleteAccountByIdDto),
  deleteAccountById
);

// บล็อกบัญชีผู้ใช้
userRoutes.put(
  "/super/users/block/:userId",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(blockAccountByIdDto),
  blockAccountById
);

// ปลดบล็อกบัญชีผู้ใช้
userRoutes.put(
  "/super/users/unblock/:userId",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(unblockAccountByIdDto),
  unblockAccountById
);

userRoutes.post(
    "/account/change-password/me",
    authMiddleware,
    allowRoles("superadmin", "admin", "member", "tourist"),
    validateDto(changePasswordDto),
    changePassword
  );
  
export default userRoutes;
