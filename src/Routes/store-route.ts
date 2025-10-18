import { Router } from "express";
import * as StoreController from "~/Controllers/store-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const storeRoute = Router();

storeRoute.get(
    "/admin/community/stores",
    validateDto(StoreController.getAllStoreForAdminDto),
    authMiddleware,
    allowRoles("admin"),
    StoreController.getAllStoreForAdmin
);
export default storeRoute;
