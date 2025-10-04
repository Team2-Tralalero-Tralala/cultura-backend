import type { Request, Response } from "express";
import { getPackages } from "../Services/package-service.js";
import { createResponse } from "~/Libs/createResponse.js";
import { createErrorResponse } from "~/Libs/createResponse.js";
/*
 * Controller : getPackagesController
 * คำอธิบาย : ดึงแพ็กเกจที่เป็นแบับร่าง (DRAFT เท่านั้น)
 * Input : req (Request) - คำขอจาก client, res (Response) - คำตอบที่จะส่งกลับไปยัง client
 * Output : ส่งผลลัพธ์กลับไปยัง client ผ่าน res
 * Process :
 *   1. เรียกใช้ฟังก์ชัน getPackages จาก Services เพื่อดึงข้อมูลแพ็กเกจ
 *   2. ถ้าสำเร็จ ส่งผลลัพธ์กลับไปยัง client พร้อมสถานะ 200 และข้อมูลแพ็กเกจ
 *   3. ถ้ามีข้อผิดพลาด เก็บข้อผิดพลาดและส่งกลับไปยัง client พร้อมสถานะ 500 และข้อความข้อผิดพลาด
 */
export async function getPackagesController(req: Request, res: Response) {
  try {
    const packages = await getPackages(req.query);
    return createResponse(res, 200, "Get packages successfully", packages);
  } catch (error) {
    return createErrorResponse(res, 500, (error as Error).message);
  }
}
