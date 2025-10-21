import { Router } from "express";
import * as DashboardController from "~/Controllers/dashboard-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const dashboardRoutes = Router();

dashboardRoutes.get(
  "/",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(DashboardController.getSuperAdminDashboardDto),
  DashboardController.getSuperAdminDashboard
);

export default dashboardRoutes;

