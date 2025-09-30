import type { Request, Response } from "express";
import { getPackages } from "../Services/package-service.js";
import { createResponse } from "~/Libs/createResponse.js";
import { createErrorResponse } from "~/Libs/createResponse.js";
/*
 * Controller : getApprovedPublishedPackagesController
 * คำอธิบาย : ดึงแพ็กเกจที่ถูกอนุมัติและเผยแพร่แล้ว
 * Process :
 *   1. เรียกใช้ service getApprovedPublishedPackages
 *   2. ส่งผลลัพธ์กลับ client พร้อม status 200
 *   3. จัดการข้อผิดพลาดด้วย status 500
 */
export async function getPackagesController(req: Request, res: Response) {// ฟังก์ชัน controller
  try {
    const packages = await getPackages(req.body);// เรียกใช้ฟังก์ชันจาก service พร้อมข้อมูลจาก client
    return createResponse(res, 200, "Get packages successfully", packages);
  } catch (error) {
    return createErrorResponse(res, 500, (error as Error).message);
  }
}
