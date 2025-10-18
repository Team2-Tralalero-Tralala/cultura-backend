import { Router } from "express";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import { getDetailRequest } from "~/Controllers/package-request-controller.js";

const router = Router();

router.get("/:requestId", authMiddleware, allowRoles("superadmin"), getDetailRequest);

export default router;
