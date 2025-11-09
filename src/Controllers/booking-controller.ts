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
  id!: string;
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
    const bookingId = Number(req.params.id);

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
    const bookingId = Number(req.params.id);
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
