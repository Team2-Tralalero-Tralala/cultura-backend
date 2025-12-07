import type { Request, Response } from "express";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import { getPackageFeedbacksByPackageIdAdmin, replyFeedbackMember} from "~/Services/feedback/feedback-service.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { ReplyFeedbackDto } from "~/Services/feedback/feedback-dto.js";


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
    const data = await getPackageFeedbacksByPackageIdAdmin(packageId, req.user);

    return createResponse(res, 200, "Get package feedbacks successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * DTO สำหรับ replyFeedback — ใช้ตรวจสอบ replyMessage
 */
export const replyFeedbackDto = {
  body: ReplyFeedbackDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : replyFeedback
 * คำอธิบาย : ตอบกลับรีวิว — controller ไม่มีการดักเงื่อนไขใด ๆ
 * หมายเหตุ : validation และ business logic ทำใน DTO + Service แล้ว
 */
export const replyFeedback: TypedHandlerFromDto<
  typeof replyFeedbackDto
> = async (req, res) => {
  try {
    const { feedbackId } = req.params as { feedbackId: string };
    const { replyMessage } = req.body as ReplyFeedbackDto;

    const data = await replyFeedbackMember(Number(feedbackId), replyMessage, req.user);

    return createResponse(res, 200, "Reply feedback successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};