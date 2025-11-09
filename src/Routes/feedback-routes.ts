import { Router } from "express";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import { getPackageFeedbacks } from "~/Controllers/feedback-controller.js";

const packageFeedbackAdminRoutes = Router();

/*
 * คำอธิบาย : Routes สำหรับดึงฟีดแบ็กทั้งหมดของแพ็กเกจ (เฉพาะแอดมิน)
 * Path : /api/admin/package/feedback/:packageId
 * Access : admin
 */

packageFeedbackAdminRoutes.get(
  "/admin/package/feedback/:packageId",
  authMiddleware,
  allowRoles("admin"),
  getPackageFeedbacks
);

export default packageFeedbackAdminRoutes;
