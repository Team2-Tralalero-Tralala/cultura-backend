import { Router } from "express";
import * as HomestayController from "~/Controllers/homestay-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const homestayRoutes = Router();

/*
 * Route : ดึง homestay ทั้งหมดในชุมชน (เฉพาะ superadmin)
 * Method : GET
 * Path   : /super/community/:communityId/homestays
 */
homestayRoutes.get(
  "/super/community/:communityId/homestays",
  validateDto(HomestayController.getHomestaysAllDto),
  authMiddleware,
  allowRoles("superadmin"),
  HomestayController.getHomestaysAll
);

export default homestayRoutes;
