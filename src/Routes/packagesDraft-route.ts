import express from "express";
import * as PackageController from "../Controllers/packagesDraft-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const router = express.Router();

router.get(
  "/admin/packages/draft",
  validateDto(PackageController.packageDto),
  authMiddleware,
  allowRoles("admin"),
  PackageController.getDraftPackages
);

export default router;