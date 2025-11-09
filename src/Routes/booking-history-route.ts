import { Router } from "express";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import {
  getByRole,
  getDetailBooking,
} from "../Controllers/booking-history-controller.js";

const router = Router();

router.get("/histories", authMiddleware, allowRoles("admin", "member"), getByRole);
router.get("/:id", getDetailBooking);

export default router;




