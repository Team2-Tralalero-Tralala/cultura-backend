/*
 * คำอธิบาย : Middleware สำหรับตรวจสอบการยืนยันตัวตน (Authentication) และสิทธิ์การเข้าถึง (Authorization)
 * ใช้ในการตรวจสอบ JWT token จาก Cookie และตรวจสอบว่า role ของผู้ใช้งานตรงกับที่อนุญาตหรือไม่
 */

import type { Request, Response, NextFunction } from "express";
import { createErrorResponse } from "~/Libs/createResponse.js";
import { verifyToken } from "~/Libs/token.js";

/*
 * ฟังก์ชัน : authMiddleware
 * คำอธิบาย : ตรวจสอบ JWT token ที่เก็บใน cookie (accessToken)
 * Input : req.cookies.accessToken
 * Output :
 *   - กำหนด req.user เมื่อ token ถูกต้อง
 *   - ส่ง error 401 ถ้า token หายไปหรือไม่ถูกต้อง
 */

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) return createErrorResponse(res, 401, "Missing token");

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return createErrorResponse(res, 401, "Invalid Token");
  }
}
/*
 * ฟังก์ชัน : allowRoles
 * คำอธิบาย : ตรวจสอบสิทธิ์การเข้าถึงตาม role ของผู้ใช้งาน
 * Input :
 *   - allow (string[]) รายชื่อ role ที่อนุญาต เช่น ["admin", "superadmin"]
 *   - req.user?.role จาก token ที่ถูก decode
 * Output :
 *   - เรียก next() ถ้า role อยู่ในรายการที่อนุญาต
 *   - ส่ง error 401 ถ้าไม่พบ role
 *   - ส่ง error 403 ถ้า role ไม่ตรงกับที่อนุญาต
 */
export function allowRoles(...allow: string[]) {
  const allowLower = allow.map((r) => r.toLowerCase());
  return (req: Request, res: Response, next: NextFunction) => {
    const roleName = req.user?.role?.toLowerCase();
    if (!roleName) return createErrorResponse(res, 401, "Unauthenticated");
    if (!allowLower.includes(roleName)) {
      return createErrorResponse(res, 403, "Forbidden");
    }
    next();
  };
}