// src/Routes/account-routes.ts
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
// GET /api/communities/members
accountRoutes.get(
  "/communities/members",
  authMiddleware,
  allowRoles("admin"),
  getMemberByAdmin
);

// POST /api/accounts
accountRoutes.post(
  "/accounts",
  validateDto(createAccountDto),
  authMiddleware,
  allowRoles("superadmin", "admin", "member"),
  createAccount
);

// PATCH /api/accounts/:id
accountRoutes.patch(
  "/accounts/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin", "admin", "member"), 
  editAccount
);
// GET /api/users
accountRoutes.get("/users", authMiddleware, allowRoles("superadmin"),getAll);

export default accountRoutes;