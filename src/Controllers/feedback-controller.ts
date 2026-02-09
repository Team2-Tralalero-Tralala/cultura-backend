import type { Request, Response } from "express";
import * as response from "~/Libs/createResponse.js";
import * as FeedbackService from "~/Services/feedback/feedback-service.js";
import { CreateFeedbackDto, ReplyFeedbackDto } from "~/Services/feedback/feedback-dto.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { IsNumberString } from "class-validator";

/* DTO : PackageIdParamDto
 * วัตถุประสงค์ :
 *  - ใช้ตรวจสอบ route parameter สำหรับ packageId
 * Input :
 *  - params :
 *    - packageId : รหัสของ package (ต้องเป็นตัวเลขในรูปแบบ string)
 * Output :
 *  - หากข้อมูลถูกต้อง จะผ่านการ validate และนำไปใช้งานต่อได้
 *  - หากข้อมูลไม่ถูกต้อง จะส่ง validation error กลับ
 */
export class PackageIdParamDto {
  @IsNumberString()
  packageId?: string;
}

/* DTO : getPackageFeedbacksForAdminDto
 * วัตถุประสงค์ :
 *  - ใช้ตรวจสอบพารามิเตอร์ packageId
 *  - สำหรับฟังก์ชัน getPackageFeedbacksForAdmin
 * Input :
 *  - params : PackageIdParamDto (ตรวจสอบ packageId)
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
 * Input :
 *  - packageId : number (รหัสแพ็กเกจจาก URL params)
 * Output :
 *  - JSON response พร้อมข้อมูล Feedback
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
 * คำอธิบาย : ดึงรายการ Feedback ทั้งหมดของทุกแพ็กเกจที่สมาชิกคนนี้เป็นคนสร้าง
 * Input :
 *  - req.user : ข้อมูลผู้ใช้ที่ล็อกอิน
 * Output :
 *  - JSON response พร้อมข้อมูล Feedback
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
 * Input :
 *  - params : FeedbackIdParamDto (ตรวจสอบ feedbackId)
 *  - body : ReplyFeedbackDto (ตรวจสอบข้อความตอบกลับ)
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
 * Input :
 *  - params : PackageIdParamDto (ตรวจสอบ packageId)
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

/**
 * คำอธิบาย : กำหนด schema สำหรับข้อมูลที่รับเข้ามาเพื่อสร้างข้อเสนอแนะ (Feedback)
 * Input: body (CreateFeedbackDto) ข้อมูลข้อเสนอแนะที่ผู้ใช้งานส่งเข้ามา
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const createFeedbackDto = {
  body: CreateFeedbackDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับสร้างข้อเสนอแนะ (Feedback) จากนักท่องเที่ยว
 * Input: req.params.bookingId, req.body (rating, message), req.files (รูปภาพ)
 * Output:
 * - 201 Created พร้อมข้อมูลข้อเสนอแนะที่สร้างสำเร็จ
 * - 400 Bad Request หาก ID ไม่ถูกต้องหรือเกิดข้อผิดพลาด
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
    const requestFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    const galleryFiles = requestFiles?.["gallery"] || [];
    const feedbackImagePaths = galleryFiles.map(
      (fileItem) => `/uploads/${fileItem.filename}`
    );
    const { rating, message } = req.body;
    const feedbackResult = await FeedbackService.createFeedback(
      id,
      {
        rating: Number(rating),
        message,
        images: feedbackImagePaths
      },
      req.user!
    );
    return response.createResponse(res, 201, "ส่งข้อเสนอแนะสำเร็จ", feedbackResult);
  } catch (error) {
    return response.createErrorResponse(res, 400, (error as Error).message);
  }
};