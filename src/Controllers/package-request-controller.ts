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
import { IsNumberString } from "class-validator";

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
}

/* DTO : RequestIdParamDto
 * วัตถุประสงค์ :
 *  - ใช้ตรวจสอบ route parameter สำหรับ requestId
 *
 * Input :
 *  - params :
 *    - requestId : รหัสของ request (ต้องเป็นตัวเลขในรูปแบบ string)
 *
 * Output :
 *  - หากข้อมูลถูกต้อง จะผ่านการ validate และนำไปใช้งานต่อได้
 *  - หากข้อมูลไม่ถูกต้อง จะส่ง validation error กลับ
 */
export class RequestIdParamDto {
  @IsNumberString()
  requestId?: string;
}

/* DTO : getDetailRequestDto
 * วัตถุประสงค์ : ใช้สำหรับตรวจสอบพารามิเตอร์ requestId
 * Input :
 *   - params : RequestIdParamDto (ตรวจสอบ requestId)
 * Output :
 *   - หากข้อมูลถูกต้อง จะอนุญาตให้ดำเนินการต่อ
 *   - หากไม่ถูกต้อง จะส่งข้อผิดพลาดกลับ
 */
export const getDetailRequestDto = {
  params: RequestIdParamDto,
} satisfies commonDto;

/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายละเอียดแพ็กเกจจาก requestId
 * Input :
 *  - req.params.requestId : string (รหัสคำขอแพ็กเกจ)
 * Output :
 *   - 200 : ดึงรายละเอียดแพ็กเกจสำเร็จ พร้อมผลลัพธ์
 *   - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 */
export const getDetailRequest: TypedHandlerFromDto<
  typeof getDetailRequestDto
> = async (req, res) => {
  try {
    const requestId = Number(req.params.requestId);
    const data = await PackageRequestService.getDetailRequestById(requestId);
    return createResponse(res,200, "Get pending super package successfully", data);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/* DTO : getDetailRequestForAdminDto
 * วัตถุประสงค์ : ใช้สำหรับตรวจสอบพารามิเตอร์ requestId
 * Input :
 *   - params : RequestIdParamDto (ตรวจสอบ requestId)
 * Output :
 *   - หากข้อมูลถูกต้อง จะอนุญาตให้ดำเนินการต่อ
 *   - หากไม่ถูกต้อง จะส่งข้อผิดพลาดกลับ
 */
export const getDetailRequestForAdminDto = {
  params: RequestIdParamDto,
} satisfies commonDto;

/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายละเอียดแพ็กเกจจาก requestId (Admin)
 * Input :
 *  - req.params.requestId : string (รหัสคำขอแพ็กเกจ)
 * Output :
 *   - 200 : ดึงรายละเอียดแพ็กเกจสำเร็จ พร้อมผลลัพธ์
 *   - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 */
export const getDetailRequestForAdmin: TypedHandlerFromDto<
  typeof getDetailRequestForAdminDto
> = async (req, res) => {
  try {
    const requestId = Number(req.params.requestId);
    const data = await PackageRequestService.getDetailRequestByIdForAdmin(requestId);
    return createResponse(res, 200, "Get pending super package successfully", data);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/* ===========================
 * Handler : PATCH /api/admin/package-requests/:packageId/approve
 * อธิบาย : อนุมัติคำขอแพ็กเกจโดย Admin → เปลี่ยนเป็น APPROVE (สำหรับคำขอสถานะ PENDING)
 * =========================== */
export const patchApprovePackageRequestForAdmin = async (
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

        const result = await PackageRequestService.approvePackageRequestForAdmin( // ใช้ Service ใหม่
            req.user,
            packageId
        );

        return createResponse(
            res,
            200,
            "Admin approved package request successfully",
            result
        );
    } catch (error) {
        return createErrorResponse(res, 400, (error as Error).message);
    }
};

/* ===========================
 * Handler : PATCH /api/admin/package-requests/:packageId/reject
 * อธิบาย : ปฏิเสธคำขอแพ็กเกจโดย Admin → บันทึกเหตุผลลง rejectReason (สำหรับคำขอสถานะ PENDING)
 * Body: { reason: string }
 * =========================== */
export const patchRejectPackageRequestForAdmin: TypedHandlerFromDto<
    typeof patchRejectPackageRequestDto // ใช้ DTO เดียวกัน
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

        const result = await PackageRequestService.rejectPackageRequestForAdmin( // ใช้ Service ใหม่
            req.user,
            packageId,
            reason
        );

        return createResponse(
            res,
            200,
            "Admin rejected package request successfully",
            result
        );
    } catch (error) {
        return createErrorResponse(res, 400, (error as Error).message);
    }
}