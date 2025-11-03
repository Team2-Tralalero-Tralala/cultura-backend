import type { Request, Response } from "express";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import { getPackageFeedbacksByPackageId } from "~/Services/feedback/feedBack-service.js";

/*
 * ฟังก์ชัน : getPackageFeedbacks
 * คำอธิบาย : Handler สำหรับดึงรายการฟีดแบ็กทั้งหมดของแพ็กเกจหนึ่ง ๆ จาก packageId
 * Input :
 *   - req.params.packageId : รหัสแพ็กเกจ
 * Output :
 *   - 200 OK พร้อมข้อมูลฟีดแบ็ก (ชื่อแพ็กเกจ, ชื่อผู้จอง, คะแนน, เวลาที่เขียน, ข้อความ, path รูป)
 *   - 400 Bad Request กรณีเกิดข้อผิดพลาด
 */
export const getPackageFeedbacks = async (req: Request, res: Response) => {
  try {
    const packageId = Number(req.params.packageId);
    const data = await getPackageFeedbacksByPackageId(packageId);
    return createResponse(res, 200, "Get package feedbacks successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
