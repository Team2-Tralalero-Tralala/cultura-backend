import { Router } from "express";
import * as authMiddleware from "../Middlewares/auth-middleware.js";
import * as upload from "~/Libs/uploadFile.js";
import * as compressUploadedFile from "~/Middlewares/upload-middleware.js";
import * as bannerController from "../Controllers/banner-controller.js";

const bannerRoutes = Router();

/**
 * คำอธิบาย : route ดึงรูปภาพ banner
 */
bannerRoutes.get(
    "/",
    authMiddleware.authMiddleware,
    authMiddleware.allowRoles("superadmin"),
    bannerController.getBanner
);

/**
 * คำอธิบาย : route สร้าง banner
 */
bannerRoutes.post(
    "/",
    authMiddleware.authMiddleware,
    authMiddleware.allowRoles("superadmin"),
    upload.upload.array("banner", 5), 
    compressUploadedFile.compressUploadedFile,
    bannerController.addBanner
);

/**
 * คำอธิบาย : route แก้ไข banner
 */
bannerRoutes.put(
    "/:id",
    authMiddleware.authMiddleware,
    authMiddleware.allowRoles("superadmin"),
    upload.upload.single("banner"), 
    compressUploadedFile.compressUploadedFile,
    bannerController.editBanner
);

/**
 * คำอธิบาย : route ลบรูปภาพ banner
 */
bannerRoutes.delete(
    "/:id",
    authMiddleware.authMiddleware,
    authMiddleware.allowRoles("superadmin"), 
    compressUploadedFile.compressUploadedFile,
    bannerController.deleteBanner
);

export default bannerRoutes;
