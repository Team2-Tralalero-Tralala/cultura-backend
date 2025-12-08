import type { Request, Response } from "express";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import * as FeedbackService from "~/Services/feedback/feedback-service.js";

/*
 * ฟังก์ชัน : getPackageFeedbacks
 * คำอธิบาย : ดึงฟีดแบ็กของแพ็กเกจ (ตรวจสิทธิ์ทำใน service)
 */
export const getPackageFeedbacksForAdmin = async (req: Request, res: Response) => {
  try {
    const packageId = Number(req.params.packageId);
    const data = await FeedbackService.getPackageFeedbacksByPackageIdAdmin(packageId, req.user!);

    return createResponse(res, 200, "Get package feedbacks successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : getPackageFeedbacksForMember
 * คำอธิบาย : ดึงฟีดแบ็กของแพ็กเกจสำหรับสมาชิก (ตรวจสิทธิ์ทำใน service)
 */
export async function getPackageFeedbacksForMember(req: Request, res: Response) {
  try {
    const packageId = Number(req.params.packageId);
    const data = await FeedbackService.getPackageFeedbacksByPackageIdMember(packageId, req.user!);

    return createResponse(res, 200, "Get package feedbacks successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}
