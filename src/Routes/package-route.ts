import express from "express";
import {getDraftPackagesController} from "../Controllers/package-controller.js";

const router = express.Router();

router.get("/admin/packages/draft", getDraftPackagesController);
validateDto(CommunityControler.packageDto),
authMiddleware,
allowRoles("admin"),

export default router;