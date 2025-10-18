import { Router } from "express";
import { getStoreById, storeDto } from "~/Controllers/store-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
const storeRoutes = Router();
// กำหนด endpoint ตามที่คุณออกแบบ
storeRoutes.get("/:id", 
    authMiddleware, 
    validateDto(storeDto), 
    allowRoles("superadmin"),
    getStoreById
);

export default storeRoutes;