import { Router } from "express";
import {
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
  forgetPasswordDto,
  forgetPassword,
} from "../Controllers/user-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const userRoutes = Router();

userRoutes.get(
  "/:userId",
  validateDto(getUserByIdDto),
  authMiddleware,
  allowRoles("superadmin", "admin", "member"),
  getUserById
);

userRoutes.get(
  "/status/:status",
  validateDto(getUserByStatusDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  getUserByStatus
);

userRoutes.delete(
  "/:userId",
  validateDto(deleteAccountByIdDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  deleteAccountById
);

userRoutes.put(
  "/block/:userId",
  validateDto(blockAccountByIdDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  blockAccountById
);

userRoutes.put(
  "/unblock/:userId",
  validateDto(unblockAccountByIdDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  unblockAccountById
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
  validateDto(forgetPasswordDto),
  authMiddleware,
  allowRoles("superadmin"),
  forgetPassword
);
export default userRoutes;
