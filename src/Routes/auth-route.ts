import { Router } from "express";
import {
  signup,
  login,
  signupDto,
  loginDto,
  logout,
} from "../Controllers/auth-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";

const authRoutes = Router();

authRoutes.post("/signup", await validateDto(signupDto), signup);
authRoutes.post("/login", await validateDto(loginDto), login);
authRoutes.post("/logout", authMiddleware, logout);

export default authRoutes;
