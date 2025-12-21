import type { Request, Response } from "express";
import * as response from "~/Libs/createResponse.js";
import * as FeedbackService from "~/Services/feedback/feedback-service.js";
import { ReplyFeedbackDto } from "~/Services/feedback/feedback-dto.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { IsNumberString } from "class-validator";

export class PackageIdParamDto {
  @IsNumberString()
  packageId?: string;
}

/* DTO : getPackageFeedbacksForAdminDto
 * วัตถุประสงค์ :
 *  - ใช้ตรวจสอบพารามิเตอร์ packageId
 *  - สำหรับฟังก์ชัน getPackageFeedbacksForAdmin
 *
 * Input :
 *  - params : PackageIdParamDto (ตรวจสอบ packageId)
 *
 * Output :
 *  - หากข้อมูลถูกต้อง จะอนุญาตให้ดำเนินการต่อ
 *  - หากไม่ถูกต้อง จะส่งข้อผิดพลาดกลับ
 */
export const getPackageFeedbacksForAdminDto = {
  params: PackageIdParamDto,
} satisfies commonDto;

/**
 * คำอธิบาย :
 *  - ดึงรายการ Feedback ของแพ็กเกจสำหรับแอดมิน
 *  - ตรวจสอบสิทธิ์และความเป็นเจ้าของ community ภายใน service
 *
 * Input :
 *  - packageId : number (รหัสแพ็กเกจจาก URL params)
 *
 * Output :
 *  - รายการ Feedback ของแพ็กเกจ
 *
 * Error :
 *  - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 */
export const getPackageFeedbacksForAdmin: TypedHandlerFromDto<
  typeof getPackageFeedbacksForAdminDto
> = async (req, res) => {
  try {
    const packageId = Number(req.params.packageId);

    const data = await FeedbackService.getPackageFeedbacksByPackageIdAdmin(
      packageId,
      req.user!
    );

    return response.createResponse(res, 200, "Get package feedbacks successfully", data);
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


/* DTO : replyFeedbackDto
 * วัตถุประสงค์ :
 *  - ใช้ตรวจสอบพารามิเตอร์ feedbackId
 *  - ใช้ตรวจสอบ body สำหรับการตอบกลับ feedback
 *
 * Input :
 *  - params : FeedbackIdParamDto (ตรวจสอบ feedbackId)
 *  - body : ReplyFeedbackDto (ตรวจสอบข้อความตอบกลับ)
 *
 * Output :
 *  - หากข้อมูลถูกต้อง จะอนุญาตให้ดำเนินการต่อ
 *  - หากไม่ถูกต้อง จะส่งข้อผิดพลาดกลับ
 */
export const replyFeedbackDto = {
  body: ReplyFeedbackDto,
} satisfies commonDto;

/**
 * คำอธิบาย : ตอบกลับ Feedback
 * Input :
 *  - feedbackId : number (รหัส feedback จาก URL params)
 *  - replyMessage : string (ข้อความตอบกลับ)
 * Output : ข้อมูล Feedback หลังจากตอบกลับสำเร็จ
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

/* DTO : getPackageFeedbacksForMemberDto
 * วัตถุประสงค์ :
 *  - ใช้ตรวจสอบพารามิเตอร์ packageId
 *  - สำหรับฟังก์ชัน getPackageFeedbacksForMember
 *
 * Input :
 *  - params : PackageIdParamDto (ตรวจสอบ packageId)
 *
 * Output :
 *  - หากข้อมูลถูกต้อง จะอนุญาตให้ดำเนินการต่อ
 *  - หากไม่ถูกต้อง จะส่งข้อผิดพลาดกลับ
 */
export const getPackageFeedbacksForMemberDto = {
  params: PackageIdParamDto,
} satisfies commonDto;

/**
 * คำอธิบาย : ดึงรายการ Feedback ของแพ็กเกจสำหรับสมาชิก
 * Input : packageId : number (รหัสแพ็กเกจจาก URL params)
 * Output : รายการ Feedback ของแพ็กเกจ
 */
export const getPackageFeedbacksForMember: TypedHandlerFromDto<
  typeof getPackageFeedbacksForMemberDto
> = async (req, res) => {
  try {
    const packageId = Number(req.params.packageId);

    const data =
      await FeedbackService.getPackageFeedbacksByPackageIdMember(
        packageId,
        req.user!
      );

    return response.createResponse(res, 200, "Get package feedbacks successfully", data);
  } catch (error) {
    return response.createErrorResponse(res, 400, (error as Error).message);
  }
};

/**
 * คำอธิบาย : ตอบกลับ Feedback
 * Input :
 *  - feedbackId : number (รหัส feedback จาก URL params)
 *  - replyMessage : string (ข้อความตอบกลับ)
 * Output : ข้อมูล Feedback หลังจากตอบกลับสำเร็จ
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
