// src/Routes/account-routes.ts
import { Router } from "express";
import { getMemberByAdmin } from "../Controllers/admin-members-controller.js";
import {
  createAccount,
  createAccountDto,
  editAccount,
  editAccountDto,
  getAll,
} from "../Controllers/account-controller.js";
import { validateDto } from "../Libs/validateDto.js";
import { authMiddleware, allowRoles } from "../Middlewares/auth-middleware.js";


const accountRoutes = Router();
// GET /api/admin/communities/:communityId/members
accountRoutes.get(
  "/communities/members",
  authMiddleware,
  allowRoles("admin"), // ปรับ role ตาม requirement ทีมได้
  getMemberByAdmin
);

// POST /api/accounts
accountRoutes.post(
  "/accounts",
  validateDto(createAccountDto),
  authMiddleware,
  allowRoles("superadmin", "admin", "member"), // ปรับ role ตาม requirement ทีมได้
  createAccount
);

// PATCH /api/accounts/:id
accountRoutes.patch(
  "/accounts/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin", "admin", "member"), // ปรับได้เช่นกัน
  editAccount
);

accountRoutes.get("/users", authMiddleware, allowRoles("superadmin"),getAll);

export default accountRoutes;