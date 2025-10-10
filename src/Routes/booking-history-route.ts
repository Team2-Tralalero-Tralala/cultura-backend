import { Router } from "express";
import { authMiddleware } from "~/Middlewares/auth-middleware.js";
import { getByRole } from "../Controllers/booking-history-controller.js";
import * as bookingController from "../Controllers/booking-history-controller.js";
import { validateDto } from "~/Libs/validateDto.js";

const router = Router();

router.get("/role", authMiddleware, getByRole);

export default router;




