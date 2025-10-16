// src/Controllers/homestay-controller.ts
import type { Request, Response } from "express";
import * as HomestayService from "../Services/homestay/homestay-service.js";
import type { commonDto } from "~/Libs/Types/TypedHandler.js";
import { HomestayDto } from "~/Services/homestay/homestay-dto.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/* ============================================================================================
 * DTO SCHEMAS (สำหรับ middleware validate)
 * ============================================================================================ */
export const createHomestayDto = {
    body: HomestayDto,
} satisfies commonDto;

export const bulkCreateHomestayDto = {
    body: [HomestayDto],
} satisfies commonDto;

export const editHomestayDto = {
    body: HomestayDto, // ถ้ามี Update DTO แยก ให้สลับมาใช้ได้
} satisfies commonDto;

/* ============================================================================================
 * CONTROLLERS — SuperAdmin only
 * ============================================================================================ */

/**
 * POST /super/homestays/:communityId
 * สร้าง Homestay 1 รายการภายใต้ชุมชนที่กำหนด
 */
export const createHomestay = async (req: Request, res: Response) => {
    try {
        if (!req.user) return createErrorResponse(res, 401, "Unauthorized");

        const currentUserId = Number(req.user.id);
        const communityId = Number(req.params.communityId);
        if (!communityId) return createErrorResponse(res, 400, "communityId ต้องเป็นตัวเลข");

        const result = await HomestayService.createHomestayBySuperAdmin(
            currentUserId,
            communityId,
            req.body as HomestayDto
        );

        return createResponse(res, 200, "Create Homestay Success", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

/**
 * POST /super/homestays/:communityId/bulk
 * สร้าง Homestay หลายรายการ (bulk) ภายใต้ชุมชนที่กำหนด
 */
export const createHomestaysBulk = async (req: Request, res: Response) => {
    try {
        if (!req.user) return createErrorResponse(res, 401, "Unauthorized");

        const currentUserId = Number(req.user.id);
        const communityId = Number(req.params.communityId);
        if (!communityId) return createErrorResponse(res, 400, "communityId ต้องเป็นตัวเลข");

        const body = req.body as HomestayDto[]; // คาดหวังเป็น array
        if (!Array.isArray(body) || body.length === 0) {
            return createErrorResponse(res, 400, "body ต้องเป็นอาเรย์ของ Homestay อย่างน้อย 1 รายการ");
        }

        const result = await HomestayService.createHomestaysBulkBySuperAdmin(
            currentUserId,
            communityId,
            body
        );

        return createResponse(res, 200, "Create Homestays (Bulk) Success", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

/**
 * GET /super/homestays
 * ดึงรายการ Homestay (สำหรับ SuperAdmin)
 * Query: page, limit, communityId (optional filter)
 */
export const getHomestays = async (req: Request, res: Response) => {
    try {
        if (!req.user) return createErrorResponse(res, 401, "Unauthorized");

        const currentUserId = Number(req.user.id);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const filters: { communityId?: number; q?: string } = {};
        if (req.query.communityId) filters.communityId = Number(req.query.communityId);
        if (typeof req.query.q === "string" && req.query.q.trim()) filters.q = req.query.q.trim();

        const result = await HomestayService.getHomestaysBySuperAdmin(
            currentUserId,
            page,
            limit,
            filters,              // ← ส่งเป็น object
        );

        return createResponse(res, 200, "Get Homestays Success", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};


/**
 * GET /super/homestays/:id
 * ดูรายละเอียด Homestay รายการเดียว
 */
export const getHomestayDetail = async (req: Request, res: Response) => {
    try {
        if (!req.user) return createErrorResponse(res, 401, "Unauthorized");

        const homestayId = Number(req.params.homestayId);
        if (!homestayId) return createErrorResponse(res, 400, "ID must be a number");

        const result = await HomestayService.getHomestayDetailById(homestayId);
        if (!result) return createErrorResponse(res, 404, "ไม่พบ Homestay ที่ต้องการ");

        return createResponse(res, 200, "Get Homestay Detail Success", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

/**
 * PATCH /super/homestays/:id
 * แก้ไข Homestay
 */
export const editHomestay = async (req: Request, res: Response) => {
    try {
        if (!req.user) return createErrorResponse(res, 401, "Unauthorized");

        const currentUserId = Number(req.user.id);
        const id = Number(req.params.homestayId);
        if (!id) return createErrorResponse(res, 400, "ID must be a number");

        const result = await HomestayService.editHomestayBySuperAdmin(
            currentUserId,
            id,
            req.body as HomestayDto
        );

        return createResponse(res, 200, "Homestay Updated", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};