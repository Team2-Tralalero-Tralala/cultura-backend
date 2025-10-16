import { Router } from "express";
import {
  signup,
  login,
  signupDto,
  loginDto,
  logout,
  me,
  checkLoginDto,
} from "../Controllers/auth-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";

const authRoutes = Router();

authRoutes.post("/signup", await validateDto(signupDto), signup);
authRoutes.post("/login", await validateDto(loginDto), login);
authRoutes.post("/logout", authMiddleware, logout);
authRoutes.get("/me", authMiddleware, validateDto(checkLoginDto), me);

export default authRoutes;
