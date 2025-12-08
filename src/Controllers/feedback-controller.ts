import type { Request, Response } from "express";
import * as createResponse from "~/Libs/createResponse.js";
import * as packageFeedbacks from "~/Services/feedback/feedback-service.js";

/*
 * ฟังก์ชัน : getPackageFeedbacks
 * คำอธิบาย : ดึงรายการฟีดแบ็กของแพ็กเกจจาก packageId
 * หมายเหตุ : ตรวจสอบสิทธิ์/ความเป็นเจ้าของ community ทำใน service แล้ว
 */
export const getPackageFeedbacks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const packageId = Number(req.params.packageId);
    const data = await packageFeedbacks.getPackageFeedbacksByPackageId(packageId, req.user);

    return createResponse.createResponse(res, 200, "Get package feedbacks successfully", data);
  } catch (error) {
    return createResponse.createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : getMemberAllFeedbacks
 * คำอธิบาย : ดึงรายการ Feedback ทั้งหมดของทุกแพ็กเกจที่สมาชิกคนนี้เป็นคนสร้าง
 */
export const getMemberAllFeedbacks = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const data = await packageFeedbacks.getAllMemberFeedbacks(req.user);

    return createResponse.createResponse(res, 200, "Get all member feedbacks successfully", data);
  } catch (error) {
    return createResponse.createErrorResponse(res, 400, (error as Error).message);
  }
};
