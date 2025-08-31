import { Router } from "express";
import { signup, login, signupDto, loginDto } from "../Controllers/auth-controller.js";
import { validateDto } from "~/Libs/validateDto.js";

const authRoutes = Router();

authRoutes.post("/signup", await validateDto(signupDto), signup);
authRoutes.post("/login", await validateDto(loginDto), login);

export default authRoutes;