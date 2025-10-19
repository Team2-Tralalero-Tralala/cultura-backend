// src/Routes/account-routes.ts
/*
 * Module: Account Routes
 * Description: กำหนดเส้นทาง API สำหรับการจัดการบัญชีผู้ใช้ในระบบ Cultura
 * Role Access: SuperAdmin, Admin, Member
 */
import { Router } from "express";
import {
  createAccount,
  createAccountDto,
  editAccount,
  editAccountDto,
  getAccountById,
  getAll,
  getMemberByAdmin,
} from "../Controllers/account-controller.js";
import { validateDto } from "../Libs/validateDto.js";
import { authMiddleware, allowRoles } from "../Middlewares/auth-middleware.js";

const accountRoutes = Router();

/** ----------------------------------------
 * 🔹 Admin ดึงสมาชิกในชุมชนของตัวเอง
 * ---------------------------------------- */
accountRoutes.get(
  "/super/communities/members",
  authMiddleware,
  allowRoles("admin"),
  getMemberByAdmin
);

/** ----------------------------------------
 * 🔹 สร้างบัญชี (SuperAdmin เท่านั้น)
 * ---------------------------------------- */
accountRoutes.post(
  "/accounts",
  validateDto(createAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  createAccount
);

/** ----------------------------------------
 * 🔹 แก้ไขบัญชี (ใช้กับ path /accounts/:id)
 * ---------------------------------------- */
accountRoutes.patch(
  "/accounts/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);

/** ----------------------------------------
 * 🔹 ดึง user ทั้งหมด (SuperAdmin)
 * ---------------------------------------- */
accountRoutes.get(
  "/users",
  authMiddleware,
  allowRoles("superadmin"),
  getAll
);

/** ----------------------------------------
 * 🔹 ดึงข้อมูลผู้ใช้ตาม role
 * ---------------------------------------- */
accountRoutes.get(
  "/super/account/admin/:id",
  authMiddleware,
  allowRoles("superadmin"),
  getAccountById
);
accountRoutes.get(
  "/super/account/member/:id",
  authMiddleware,
  allowRoles("superadmin"),
  getAccountById
);
accountRoutes.get(
  "/super/account/tourist/:id",
  authMiddleware,
  allowRoles("superadmin"),
  getAccountById
);

/** ----------------------------------------
 * 🔹 อัปเดตข้อมูลผู้ใช้ตาม role (SuperAdmin เท่านั้น)
 * ---------------------------------------- */
accountRoutes.patch(
  "/super/account/admin/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);
accountRoutes.patch(
  "/super/account/member/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);
accountRoutes.patch(
  "/super/account/tourist/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);

export default accountRoutes;