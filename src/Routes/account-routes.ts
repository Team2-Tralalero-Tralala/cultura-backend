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
  getAll,
  getMemberByAdmin,
} from "../Controllers/account-controller.js";
import { validateDto } from "../Libs/validateDto.js";
import { authMiddleware, allowRoles } from "../Middlewares/auth-middleware.js";


const accountRoutes = Router();
// GET /api/super/communities/members - ดึงข้อมูลสมาชิกทั้งหมดในชุมชน (เฉพาะ admin)
accountRoutes.get(
  "/super/communities/members",
  authMiddleware,
  allowRoles("admin"),
  getMemberByAdmin
);

// POST /api/accounts
accountRoutes.post(
  "/accounts",
  validateDto(createAccountDto),
  authMiddleware,
  allowRoles("superadmin"), //  superadmin เท่านั้นที่สร้าง account ได้
  createAccount
);

// PATCH /api/accounts/:id
accountRoutes.patch(
  "/accounts/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);
// GET /api/users
accountRoutes.get("/users", authMiddleware, allowRoles("superadmin"),getAll);

export default accountRoutes;