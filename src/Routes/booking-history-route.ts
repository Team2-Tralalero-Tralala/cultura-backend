import { Router } from "express";
import { authMiddleware } from "~/Middlewares/auth-middleware.js";
import { getByRole } from "../Controllers/booking-history-controller.js";

const router = Router();

router.get("/role", authMiddleware, getByRole);

export default router;


