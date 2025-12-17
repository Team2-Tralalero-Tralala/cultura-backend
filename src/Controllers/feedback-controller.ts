import type { Request, Response } from "express";
import * as response from "~/Libs/createResponse.js";
import * as FeedbackService from "~/Services/feedback/feedback-service.js";
import { CreateFeedbackDto, ReplyFeedbackDto } from "~/Services/feedback/feedback-dto.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

/*
 * ฟังก์ชัน : getPackageFeedbacks
 * คำอธิบาย : ดึงรายการฟีดแบ็กของแพ็กเกจจาก packageId
 * หมายเหตุ : ตรวจสอบสิทธิ์/ความเป็นเจ้าของ community ทำใน service แล้ว
 */
export const getPackageFeedbacksForAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const packageId = Number(req.params.packageId);
    const data = await FeedbackService.getPackageFeedbacksByPackageIdAdmin(
      packageId,
      req.user
    );

    return response.createResponse(
      res,
      200,
      "Get package feedbacks successfully",
      data
    );
  } catch (error) {
    return response.createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : getMemberAllFeedbacks
 * คำอธิบาย : ดึงรายการ Feedback ทั้งหมดของทุกแพ็กเกจที่สมาชิกคนนี้เป็นคนสร้าง
 */
export const getMemberAllFeedbacks = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const data = await FeedbackService.getAllMemberFeedbacks(req.user);

    return response.createResponse(
      res,
      200,
      "Get all member feedbacks successfully",
      data
    );
  } catch (error) {
    return response.createErrorResponse(res, 400, (error as Error).message);
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

    const data = await FeedbackService.replyFeedbackMember(
      Number(feedbackId),
      replyMessage,
      req.user
    );

    return response.createResponse(
      res,
      200,
      "Reply feedback successfully",
      data
    );
  } catch (error) {
    return response.createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : getPackageFeedbacksForMember
 * คำอธิบาย : ดึงรายการฟีดแบ็กของแพ็กเกจจาก packageId สำหรับสมาชิก (Member)
 * หมายเหตุ : ตรวจสอบสิทธิ์และความเป็นผู้ดูแลแพ็กเกจทำใน Service แล้ว
 */
export async function getPackageFeedbacksForMember(
  req: Request,
  res: Response
) {
  try {
    const packageId = Number(req.params.packageId);
    const data = await FeedbackService.getPackageFeedbacksByPackageIdMember(
      packageId,
      req.user!
    );

    return response.createResponse(
      res,
      200,
      "Get package feedbacks successfully",
      data
    );
  } catch (error) {
    return response.createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * ฟังก์ชัน : replyFeedbackAdmin
 * คำอธิบาย : ตอบกลับรีวิว
 * หมายเหตุ : validation และ business logic ทำใน DTO + Service แล้ว
 */
export const replyFeedbackAdmin: TypedHandlerFromDto<
  typeof replyFeedbackDto
> = async (req, res) => {
  try {
    const { feedbackId } = req.params as { feedbackId: string };
    const { replyMessage } = req.body as ReplyFeedbackDto;

    const data = await FeedbackService.replyFeedbackAdmin(
      Number(feedbackId),
      replyMessage,
      req.user
    );

    return response.createResponse(
      res,
      200,
      "Reply feedback successfully",
      data
    );
  } catch (error) {
    return response.createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * DTO สำหรับ createFeedback
 */
export const createFeedbackDto = {
  body: CreateFeedbackDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : createFeedback
 * คำอธิบาย : รับ Request สร้างรีวิวจากนักท่องเที่ยว
 * Path : POST /api/tourist/booking-history/:bookingId/feedback
 */
export const createFeedback: TypedHandlerFromDto<typeof createFeedbackDto> = async (
  req,
  res
) => {
  try {
    const { bookingId } = req.params as { bookingId: string }; 
    const id = Number(bookingId);
    if (isNaN(id)) {
      return response.createErrorResponse(res, 400, "ID การจองไม่ถูกต้อง");
    }
    const { rating, message, images } = req.body;
    const data = await FeedbackService.createFeedback(
      id,
      { rating, message, images: images ?? [] },
      req.user!
    );
    return response.createResponse(res, 201, "ส่งข้อเสนอแนะสำเร็จ", data);
  } catch (error) {
    return response.createErrorResponse(res, 400, (error as Error).message);
  }
};