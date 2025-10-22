import { Router } from "express";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import { getByRole } from "../Controllers/booking-history-controller.js";

const router = Router();

router.get("/histories", authMiddleware, allowRoles("admin", "mmeber"), getByRole);

export default router;




