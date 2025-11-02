import { Router } from "express";
import {
  createPackage,
  editPackage,
  deletePackage,
  getPackageByRole,
  getPackageById,
  createPackageDto,
  editPackageDto,
} from "../Controllers/package-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const packageRoutes = Router();
// กำหนด endpoint ตามที่คุณออกแบบ
packageRoutes.post(
  "/",
  authMiddleware,
  validateDto(createPackageDto),
  allowRoles("admin", "member"),
  createPackage
);
packageRoutes.get(
  "/",
  authMiddleware,
  allowRoles("superadmin", "admin", "member", "tourist"),
  getPackageByRole
);
packageRoutes.get(
  "/:id",
  authMiddleware,
  allowRoles("superadmin", "admin", "member", "tourist"),
  getPackageById
);
packageRoutes.put(
  "/:id",
  authMiddleware,
  validateDto(editPackageDto),
  allowRoles("superadmin", "admin", "member"),
  editPackage
);
packageRoutes.delete(
  "/:id",
  authMiddleware,
  allowRoles("superadmin", "admin", "member"),
  deletePackage
);
export default packageRoutes;
