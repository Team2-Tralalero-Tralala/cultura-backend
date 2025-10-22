import { Router } from "express";
import { validateDto } from "../Libs/validateDto.js";
import { allowRoles, authMiddleware } from "../Middlewares/auth-middleware.js";
import { upload } from "~/Libs/uploadFile.js";
import { compressUploaded } from "~/Middlewares/upload-middleware.js";
import { addBanner, getBanner, editBanner, deleteBanner } from "../Controllers/banner-controller.js";

const bannerRoutes = Router();

bannerRoutes.get(
    "/",
    authMiddleware,
    allowRoles("superadmin"),
    getBanner
);

bannerRoutes.post(
    "/",
    authMiddleware,
    allowRoles("superadmin"),
    upload.array("banner", 5), 
    compressUploaded,
    addBanner
);

bannerRoutes.put(
    "/:id",
    authMiddleware,
    allowRoles("superadmin"),
    upload.single("banner"), 
    compressUploaded,
    editBanner
);

bannerRoutes.delete(
    "/:id",
    authMiddleware,
    allowRoles("superadmin"), 
    compressUploaded,
    deleteBanner
);

export default bannerRoutes;
