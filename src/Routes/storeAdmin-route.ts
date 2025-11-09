import { Router } from "express";
import { getStoreById, storeDto } from "~/Controllers/storeAdmin-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
const storeRoutes = Router();
// กำหนด endpoint สำหรับดึงข้อมูลร้านค้าตาม ID
storeRoutes.get("/:id", 
    authMiddleware, 
    validateDto(storeDto), 
    allowRoles("admin"),
    getStoreById
);

export default storeRoutes;