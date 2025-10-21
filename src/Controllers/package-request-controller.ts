/*
 * คำอธิบาย : Controller สำหรับรายการคำขอแพ็กเกจ (เฉพาะฟิลด์ที่จำเป็นต่อหน้า list)
 * เส้นทาง : GET /api/super/package-requests
 * ฟิลด์ค้นหา/กรอง : search, statusApprove
 * รองรับ pagination : page, limit
 */

import type { Request, Response } from "express";
import * as PackageRequestService from "~/Services/package/package-request-service.js";
import type { commonDto, TypedHandlerFromDto } from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import {
    PackageRequestQueryDto,
    RejectReasonDto,
} from "~/Services/package/package-request-dto.js";

/* ===========================
 * DTO : getPackageRequestAllDto
 * อธิบาย : กำหนด schema ของ query สำหรับดึงรายการคำขอแพ็กเกจ
 * =========================== */
export const getPackageRequestAllDto = {
    query: PackageRequestQueryDto, // page, limit, search, statusApprove
} satisfies commonDto;

/* ===========================
 * Handler : GET /api/super/package-requests
 * อธิบาย : ดึงรายการคำขอแพ็กเกจตามสิทธิ์ผู้ใช้ พร้อมค้นหา/กรองและ pagination
 * =========================== */
export const getPackageRequestAll: TypedHandlerFromDto<
    typeof getPackageRequestAllDto
> = async (req, res) => {
    try {
        if (!req.user) {
            return createErrorResponse(res, 401, "User not authenticated");
        }

        const { page = 1, limit = 10, search, statusApprove } = req.query;

        const result = await PackageRequestService.getPackageRequestAll(
            req.user,
            page,
            limit,
            search,
            statusApprove
        );

        return createResponse(
            res,
            200,
            "Package requests retrieved successfully",
            result
        );
    } catch (error) {
        return createErrorResponse(res, 400, (error as Error).message);
    }
};

/* ===========================
 * Handler : PATCH /api/super/package-requests/:packageId/approve
 * อธิบาย : อนุมัติคำขอแพ็กเกจ → เปลี่ยนเป็น APPROVE
 * =========================== */
export const patchApprovePackageRequest = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return createErrorResponse(res, 401, "User not authenticated");
        }

        const packageId = Number(req.params.packageId);
        if (!Number.isFinite(packageId)) {
            return createErrorResponse(res, 400, "packageId ต้องเป็นตัวเลข");
        }

        const result = await PackageRequestService.approvePackageRequest(
            req.user,
            packageId
        );

        return createResponse(
            res,
            200,
            "Approve package request success",
            result
        );
    } catch (error) {
        return createErrorResponse(res, 400, (error as Error).message);
    }
};

/* ===========================
 * DTO : patchRejectPackageRequestDto
 * อธิบาย : validate params + body (เหตุผลการปฏิเสธ)
 * =========================== */
export const patchRejectPackageRequestDto = {
    params: {
        packageId: "number",
    },
    body: RejectReasonDto,
} satisfies commonDto;

/* ===========================
 * Handler : PATCH /api/super/package-requests/:packageId/reject
 * อธิบาย : ปฏิเสธคำขอแพ็กเกจ → บันทึกเหตุผลลง rejectReason
 * Body: { reason: string }
 * =========================== */
export const patchRejectPackageRequest: TypedHandlerFromDto<
    typeof patchRejectPackageRequestDto
> = async (req, res) => {
    try {
        if (!req.user) {
            return createErrorResponse(res, 401, "User not authenticated");
        }

        const packageId = Number(req.params.packageId);
        if (!Number.isFinite(packageId)) {
            return createErrorResponse(res, 400, "packageId ต้องเป็นตัวเลข");
        }

        const reason = (req.body?.reason ?? "").toString();
        if (!reason.trim()) {
            return createErrorResponse(
                res,
                400,
                "reason ต้องเป็นข้อความและห้ามว่าง"
            );
        }

        const result = await PackageRequestService.rejectPackageRequest(
            req.user,
            packageId,
            reason
        );

        return createResponse(
            res,
            200,
            "Reject package request success",
            result
        );
    } catch (error) {
        return createErrorResponse(res, 400, (error as Error).message);
    }
  
import { getDetailRequestById } from "~/Services/package/package-request-service.js";


/*
 * ฟังก์ชัน : getPendingSuperPackageByIdController
 * คำอธิบาย : Handler สำหรับดึงรายละเอียดแพ็กเกจจาก requestID
 * Input :
 *   - res : Response object ของ Express สำหรับส่งผลลัพธ์กลับไปยัง client
 * Output :
 *   - 200 OK พร้อมข้อมูลแพ็กเกจที่มีสถานะเป็น PENDING_SUPER
 *   - 400 Bad Request ถ้ามีข้อผิดพลาดหรือไม่สามารถดึงข้อมูลได้
 */

export const getDetailRequest = async (req: Request, res: Response) => {
  try {

    const requestIdRaw = req.params.requestId;
    const requestId = Number(requestIdRaw);

    const data = await getDetailRequestById(requestId);
    if (!data) {
      return createErrorResponse(res, 404, "Package not found");
    }
    return createResponse(res, 200, "Get pending super package successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
