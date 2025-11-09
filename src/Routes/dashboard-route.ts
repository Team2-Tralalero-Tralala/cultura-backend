import { Router } from "express";
import * as DashboardController from "~/Controllers/dashboard-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const dashboardRoutes = Router();

dashboardRoutes.get(
  "/super/dashboard",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(DashboardController.getSuperAdminDashboardDto),
  DashboardController.getSuperAdminDashboard
);
/*
 * คำอธิบาย : ใช้สำหรับดึงข้อมูล Dashboard ของ Admin
 */
dashboardRoutes.get(
  "/admin/dashboard",
  authMiddleware,
  allowRoles("admin"),
  validateDto(DashboardController.getAdminDashboardDto),
  DashboardController.getAdminDashboard
);

export default dashboardRoutes;
