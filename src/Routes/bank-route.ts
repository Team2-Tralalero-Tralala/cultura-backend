import { Router } from "express";
import * as BankController from "~/Controllers/bank-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";

const bankRoutes = Router();
/**
 * เส้นทาง : GET /super/banks
 * คำอธิบาย : ใช้สำหรับดึงรายชื่อธนาคารทั้งหมด
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
bankRoutes.get(
  "/super/banks",
  validateDto(BankController.getAllBanksDto),
  authMiddleware,
  allowRoles("superadmin"),
  BankController.getAllBanks
);

export default bankRoutes;
