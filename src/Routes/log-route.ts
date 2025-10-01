/*
 * คำอธิบาย : Routes สำหรับ Log Management
 * ประกอบด้วย endpoints สำหรับดึงข้อมูล logs ตาม role
 */
import { Router } from "express";
import { getLogs, getLogsDto } from "../Controllers/log-controller.js";
import { validateDto } from "../Libs/validateDto.js";
import { allowRoles, authMiddleware } from "../Middlewares/auth-middleware.js";

const logRoutes = Router();

/*
 * GET /logs
 * คำอธิบาย : ดึงข้อมูล logs ตาม role ของผู้ใช้พร้อม pagination
 * Access : สำหรับผู้ใช้ที่ login แล้วทุก role
 * Logic :
 *   - superadmin เห็น logs ทั้งหมด
 *   - admin เห็น logs ของสมาชิกในชุมชนที่ตนเป็น admin
 * Query Parameters :
 *   - page (optional) : หน้าที่ต้องการ (default: 1)
 *   - limit (optional) : จำนวนรายการต่อหน้า (default: 10, max: 100)
 *   - search (optional) : คำค้นหา (username, email, fname, lname)
 */
logRoutes.get(
  "/",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(getLogsDto),
  getLogs
);

export default logRoutes;
