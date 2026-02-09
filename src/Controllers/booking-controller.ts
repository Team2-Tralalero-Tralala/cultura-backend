import { IsNumberString, IsOptional, IsString } from "class-validator";
import * as RefundService from "~/Services/booking/booking-service.js";

import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import { BookingIdParamDto } from "~/Services/booking/booking-dto.js";

/*
 * คำอธิบาย : DTO สำหรับดึงรายการคำขอคืนเงินของชุมชนที่ admin ดูแล
 * Input : query (page, limit)
 * Output : ข้อมูลคำขอคืนเงินพร้อม pagination
 */
export const getRefundRequestsByAdminDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ดึงคำขอคืนเงินทั้งหมดของชุมชนที่ admin ดูแล
 * input : req, res
 * output : PaginationResponse<BookingHistory>
 */
export const getRefundRequestsByAdmin: TypedHandlerFromDto<
  typeof getRefundRequestsByAdminDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const { page = 1, limit = 10 } = req.query;

    const result = await RefundService.getRefundRequestsByAdmin(
      userId,
      Number(page),
      Number(limit)
    );

    return createResponse(res, 200, "ดึงคำขอคืนเงินสำเร็จ", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : สำหรับอนุมัติคำขอคืนเงิน
 * วัตถุประสงค์ : รับรหัสการจอง
 * input : req.params.bookingId
 * output : 
 */
export class RefundIdParamDto {
  @IsNumberString()
  bookingId!: string;
}
/**
 * DTO : สำหรับอนุมัติคำขอคืนเงิน
 * วัตถุประสงค์ : รับรหัสการจอง
 * input : req.params.bookingId
 * output : 
 */
export const approveRefundByAdminDto = {
  params: RefundIdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : อนุมัติคำขอคืนเงิน
 * input : req, res
 * output : 
 */
export const approveRefundByAdmin: TypedHandlerFromDto<
  typeof approveRefundByAdminDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const bookingId = Number(req.params.bookingId);

    const result = await RefundService.approveRefundByAdmin(userId, bookingId);
    return createResponse(res, 200, "อนุมัติคำขอคืนเงินสำเร็จ", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : สำหรับปฏิเสธคำขอคืนเงิน
 * วัตถุประสงค์ : รับรหัสการจอง
 * input : req.params.bookingId
 * output : 
 */
export class RejectRefundBodyDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
/**
 * DTO : สำหรับปฏิเสธคำขอคืนเงิน
 * วัตถุประสงค์ : รับรหัสการจอง
 * input : req.params.bookingId
 * output : 
 */
export const rejectRefundByAdminDto = {
  params: RefundIdParamDto,
  body: RejectRefundBodyDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ปฏิเสธคำขอคืนเงsิน พร้อมเหตุผล
 * input : req, res
 * output : 
 */
export const rejectRefundByAdmin: TypedHandlerFromDto<
  typeof rejectRefundByAdminDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const bookingId = Number(req.params.bookingId);
    const { reason } = req.body;

    const result = await RefundService.rejectRefundByAdmin(
      userId,
      bookingId,
      reason
    );

    return createResponse(res, 200, "ปฏิเสธคำขอคืนเงินสำเร็จ", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : สำหรับดึงรายการคำขอคืนเงินของ Package ที่ Member ดูแล
 * วัตถุประสงค์ : รับรหัสการจอง
 * input : req.params.bookingId
 * output : 
 */
export const getRefundRequestsByMemberDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ดึงคำขอคืนเงินทั้งหมดของ Package ที่ Member ดูแล (overseer)
 * input : req, res
 * output : 
 */
export const getRefundRequestsByMember: TypedHandlerFromDto<
  typeof getRefundRequestsByMemberDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const { page = 1, limit = 10 } = req.query;

    const result = await RefundService.getRefundRequestsByMember(
      userId,
      Number(page),
      Number(limit)
    );

    return createResponse(res, 200, "ดึงคำขอคืนเงินสำหรับ Member สำเร็จ", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : สำหรับ Member อนุมัติคำขอคืนเงิน
 * วัตถุประสงค์ : รับรหัสการจอง
 * input : req.params.bookingId
 * output : 
 */
export const approveRefundByMemberDto = {
  params: RefundIdParamDto,
} satisfies commonDto;

/*
 * อธิบาย : อนุมัติคำขอคืนเงิน (สำหรับ Member)
 * Input :
 * - req.params.bookingId : รหัสการจอง (bookingId)
 * - req.user.id : รหัสสมาชิกผู้ดำเนินการ (userId จาก Token)
 * Output : JSON Response (Status 200 พร้อมข้อมูลผลลัพธ์ หรือ Status 400 หากเกิดข้อผิดพลาด)
 */
export const approveRefundByMember: TypedHandlerFromDto<
  typeof approveRefundByMemberDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const bookingId = Number(req.params.bookingId);

    const result = await RefundService.approveRefundByMember(userId, bookingId);

    return createResponse(res, 200, "อนุมัติคำขอคืนเงินสำเร็จ", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : สำหรับ Member ปฏิเสธคำขอคืนเงิน
 * วัตถุประสงค์ : รับรหัสการจอง
 * input : req.params.bookingId
 * output : 
 */
export const rejectRefundByMemberDto = {
  params: RefundIdParamDto,
  body: RejectRefundBodyDto,
} satisfies commonDto;

/*
 * อธิบาย : ปฏิเสธคำขอคืนเงิน พร้อมเหตุผล (สำหรับ Member)
 * input : req, res
 * output : 
 * - req.params.bookingId : รหัสการจอง (bookingId)
 * - req.body.reason : เหตุผลการปฏิเสธ (reason)
 * - req.user.id : รหัสสมาชิกผู้ดำเนินการ (userId จาก Token)
 * Output : JSON Response (Status 200 พร้อมข้อมูลผลลัพธ์ หรือ Status 400 หากเกิดข้อผิดพลาด)
 */
export const rejectRefundByMember: TypedHandlerFromDto<
  typeof rejectRefundByMemberDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const bookingId = Number(req.params.bookingId);
    const { reason } = req.body;

    const result = await RefundService.rejectRefundByMember(
      userId,
      bookingId,
      reason
    );

    return createResponse(res, 200, "ปฏิเสธคำขอคืนเงินสำเร็จ", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : getBookingDetailDto
 * วัตถุประสงค์ : กำหนด schema สำหรับตรวจสอบพารามิเตอร์ bookingId
 * Input : params (BookingIdParamDto)
 * Output : ข้อมูลพารามิเตอร์ที่ถูกต้อง
 */
export const getBookingDetailDto = {
  params: BookingIdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับดึงรายละเอียดการจอง (ใช้แสดงในหน้าเขียน Feedback)
 * Input : req.params.bookingId - รหัสการจอง
 * Output : 
 * - 200 OK พร้อมข้อมูลการจอง (ชื่อแพ็กเกจ, รูปปก)
 * - 400 Bad Request หากไม่พบข้อมูลหรือไม่มีสิทธิ์
 */
export const getBookingDetail: TypedHandlerFromDto<typeof getBookingDetailDto> = async (
  req,
  res
) => {
  try {
    const userId = Number(req.user!.id);
    const bookingId = Number(req.params.bookingId);

    const result = await RefundService.getBookingDetailForFeedback(
      bookingId,
      userId
    );

    return createResponse(res, 200, "Get booking detail successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};