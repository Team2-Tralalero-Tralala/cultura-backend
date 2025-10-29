// 📄 user-route.ts
import { Router } from "express";
import { authMiddleware, allowRoles } from "../Middlewares/auth-middleware.js";
import { getAllUsers, getUserById } from "../Controllers/user-controller.js";

const userRouter: Router = Router();

/*
 * API: GET /api/super/users
 * คำอธิบาย : ดึงข้อมูลผู้ใช้งานทั้งหมด (เฉพาะ superadmin)
 */
userRouter.get(
  "/users",
  authMiddleware,
  allowRoles("superadmin"),
  getAllUsers
);

userRouter.get(
  "/users/:id",
  authMiddleware,
  allowRoles("superadmin"),
  getUserById
);

export default userRouter;
