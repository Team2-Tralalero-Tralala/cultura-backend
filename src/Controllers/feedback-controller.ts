import { IsNumberString } from "class-validator";

import * as FeedbackService from "~/Services/feedback/feedback-service.js";

import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";

/*
 * DTO : ตรวจสอบค่า packageId ที่มาจาก req.params
 * Input :
 *   - req.params.packageId (string — ต้องเป็นตัวเลข)
 * Output :
 *   - packageId ที่ผ่านการตรวจสอบแล้ว (string)
 */
export class PackageIdParamDto {
  @IsNumberString()
  packageId?: string;
}

/*
 * DTO : สำหรับ "ดึงฟีดแบ็กของแพ็กเกจ (Admin)"
 * Input : params (PackageIdParamDto)
 * Output : รายการ feedback ที่ถูกตรวจสอบสิทธิ์แล้ว
 */
export const getPackageFeedbacksDto = {
  params: PackageIdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getPackageFeedbacks
 * คำอธิบาย : ดึงรายการฟีดแบ็กของแพ็กเกจจาก packageId (สำหรับ Admin)
 * Input :
 *   - req.params.packageId : หมายเลขแพ็กเกจ
 *   - req.user : ผู้ใช้ที่ทำการ request (ตรวจสิทธิ์ใน middleware + service)
 * Output :
 *   - 200 : JSON ข้อมูล feedback list
 *   - 400 : ถ้าเกิด error ใน service
 */
export const getPackageFeedbacksForAdmin: TypedHandlerFromDto<
  typeof getPackageFeedbacksDto
> = async (req, res) => {
  try {
    const packageId = Number(req.params.packageId);

    const data = await FeedbackService.getPackageFeedbacksByPackageIdAdmin(
      packageId,
      req.user!
    );

    return createResponse(res, 200, "Get package feedbacks successfully", data);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : สำหรับ "ดึงฟีดแบ็กของแพ็กเกจ (Member)"
 * Input : params (PackageIdParamDto)
 * Output : รายการ feedback ที่ได้รับอนุญาตให้สมาชิกดู
 */
export const getPackageFeedbacksForMemberDto = {
  params: PackageIdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getPackageFeedbacksForMember
 * คำอธิบาย : ดึงฟีดแบ็กของแพ็กเกจจาก packageId สำหรับสมาชิก (Member)
 * Input :
 *   - req.params.packageId : หมายเลขแพ็กเกจ
 *   - req.user : สมาชิกที่เข้าชม
 * Output :
 *   - 200 : JSON ข้อมูล feedback list ที่สมาชิกเข้าถึงได้
 *   - 400 : ถ้าเกิด error ใน service
 */
export const getPackageFeedbacksForMember: TypedHandlerFromDto<
  typeof getPackageFeedbacksForMemberDto
> = async (req, res) => {
  try {
    const packageId = Number(req.params.packageId);

    const data = await FeedbackService.getPackageFeedbacksByPackageIdMember(
      packageId,
      req.user!
    );

    return createResponse(res, 200, "Get package feedbacks successfully", data);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};
