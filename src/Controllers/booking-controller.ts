import { IsNumberString, IsOptional, IsString } from "class-validator";
import * as RefundService from "~/Services/booking/booking-service.js";

import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import { PaginationDto } from "~/Services/pagination-dto.js";

/*
 * คำอธิบาย : DTO สำหรับดึงรายการคำขอคืนเงินของชุมชนที่ admin ดูแล
 * Input : query (page, limit)
 * Output : ข้อมูลคำขอคืนเงินพร้อม pagination
 */
export const getRefundRequestsByAdminDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getRefundRequestsByAdmin
 * อธิบาย : ดึงคำขอคืนเงินทั้งหมดของชุมชนที่ admin ดูแล
 * Route : GET /admin/refunds
 * Output : PaginationResponse<BookingHistory>
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
 */
export class RefundIdParamDto {
  @IsNumberString()
  bookingId!: string;
}

export const approveRefundByAdminDto = {
  params: RefundIdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : approveRefundByAdmin
 * อธิบาย : อนุมัติคำขอคืนเงิน
 * Route : PATCH /admin/refunds/:id/approve
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
 */
export class RejectRefundBodyDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export const rejectRefundByAdminDto = {
  params: RefundIdParamDto,
  body: RejectRefundBodyDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : rejectRefundByAdmin
 * อธิบาย : ปฏิเสธคำขอคืนเงิน พร้อมเหตุผล
 * Route : PATCH /admin/refunds/:id/reject
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
 * คำอธิบาย : DTO สำหรับดึงรายการคำขอคืนเงินของ Package ที่ Member ดูแล
 * Input : query (page, limit)
 * Output : ข้อมูลคำขอคืนเงินพร้อม pagination
 */
export const getRefundRequestsByMemberDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getRefundRequestsByMember
 * อธิบาย : ดึงคำขอคืนเงินทั้งหมดของ Package ที่ Member ดูแล (overseer)
 * Route : GET /member/refunds
 * Output : PaginationResponse<BookingHistory>
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
 * Configuration DTO : สำหรับ Member อนุมัติคำขอคืนเงิน
 */
export const approveRefundByMemberDto = {
  params: RefundIdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : approveRefundByMember
 * อธิบาย : อนุมัติคำขอคืนเงิน (สำหรับ Member)
 * Route : PATCH /member/refunds/:id/approve
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
 * Configuration DTO : สำหรับ Member ปฏิเสธคำขอคืนเงิน
 */
export const rejectRefundByMemberDto = {
  params: RefundIdParamDto,
  body: RejectRefundBodyDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : rejectRefundByMember
 * อธิบาย : ปฏิเสธคำขอคืนเงิน พร้อมเหตุผล (สำหรับ Member)
 * Route : PATCH /member/refunds/:id/reject
 * Input :
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