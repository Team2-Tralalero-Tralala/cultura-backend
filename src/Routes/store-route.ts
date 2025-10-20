import { Router } from "express";
import * as StoreController from "~/Controllers/store-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const storeRoute = Router();

/**
 * คำอธิบาย : route สำหรับดึงข้อมูลร้านค้าทั้งหมดมาแสดง
 */
storeRoute.get(
    "/super/community/:communityId/store",
    validateDto(StoreController.getAllStoreDto),
    authMiddleware,
    allowRoles("superadmin"),
    StoreController.getAllStore
);

export default storeRoute;