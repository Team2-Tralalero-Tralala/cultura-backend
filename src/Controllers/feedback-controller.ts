// src/Controllers/feedback/package-feedback-admin-controller.ts
import type { Request, Response } from "express";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import { getPackageFeedbacksByPackageId } from "~/Services/feedback/feedback-service.js";

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
    const data = await getPackageFeedbacksByPackageId(packageId, req.user);

    return createResponse(res, 200, "Get package feedbacks successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
