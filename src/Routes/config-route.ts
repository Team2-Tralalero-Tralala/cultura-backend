import { Router } from "express";
import {
    disableServer,
    enableServer,
    getServerStatus,
} from "../Controllers/config-controller.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";

const configRoutes = Router();

// GET /shared/server-status - ดูสถานะการทำงานของเซิร์ฟเวอร์
configRoutes.get("/shared/server-status", getServerStatus);

// POST /super/server/enable - เปิดเซิร์ฟเวอร์
configRoutes.post("/super/server/enable",
    authMiddleware,
    allowRoles("superadmin"),
    enableServer);

// POST /super/server/disable - ปิดเซิร์ฟเวอร์
configRoutes.post("/super/server/disable",
    authMiddleware,
    allowRoles("superadmin"),
    disableServer);

export default configRoutes;
