import type { Request, Response } from "express";
import * as HomestayService from "../Services/homestay/homestay-service.js";
import { HomestayDto } from "~/Services/homestay/homestay-dto.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { IsNumberString } from "class-validator";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
/*
 * คำอธิบาย : Schema สำหรับ validate ข้อมูลตอน "สร้าง Homestay (เดี่ยว)" สำหรับ SuperAdmin
 * Input  : body (HomestayDto)
 * Notice : เส้นทางจะมี params.communityId (ตรวจใน route/controller ไม่อยู่ใน DTO)
 * Routes : POST /super/community/:communityId/homestay
 * Output : commonDto object
*/
export const createHomestayDto = {
    body: HomestayDto,
} satisfies commonDto;

/*
 * POST /super/community/:communityId/homestay
 * (alias รองรับ) POST /super/homestays/:communityId
 * สร้าง Homestay 1 รายการภายใต้ชุมชนที่กำหนด
 * Input: params.communityId, body: HomestayDto
 * Output: 200 + ข้อมูลที่พักที่ถูกสร้าง
*/
export const createHomestay = async (req: Request, res: Response) => {
    try {
        if (!req.user) return createErrorResponse(res, 401, "Unauthorized");

        const communityId = Number(req.params.communityId);
        if (!communityId) return createErrorResponse(res, 400, "communityId ต้องเป็นตัวเลข");

        // ① รับไฟล์
        const files = req.files as {
            cover?: Express.Multer.File[];
            gallery?: Express.Multer.File[];
        };

        // ตรวจชนิด content-type
        const isMultipart = req.is("multipart/form-data");

        // พาร์ส body
        let parsed: any;
        if (isMultipart) {
            if (!req.body?.data) {
                return createErrorResponse(res, 400, "ฟิลด์ 'data' (JSON string) ต้องถูกส่งมาใน multipart/form-data");
            }
            try {
                parsed = JSON.parse(req.body.data);
            } catch {
                return createErrorResponse(res, 400, "ฟิลด์ 'data' ไม่ใช่ JSON ที่ถูกต้อง");
            }
        } else {
            // รองรับ application/json ตรง ๆ
            parsed = req.body;
            if (!parsed || typeof parsed !== "object") {
                return createErrorResponse(res, 400, "Body ต้องเป็น JSON object");
            }
        }

        // ③ รวมไฟล์เป็น homestayImage (เหมือน createStore)
        const homestayImage = [
            ...(files?.cover?.map(f => ({ image: f.path, type: "COVER" })) ?? []),
            ...(files?.gallery?.map(f => ({ image: f.path, type: "GALLERY" })) ?? []),
        ];

        const result = await HomestayService.createHomestayBySuperAdmin(
            Number(req.user.id),
            communityId,
            { ...parsed, homestayImage } as HomestayDto
        );

        return createResponse(res, 201, "Create Homestay Success", result);
    } catch (error: any) {
        return createErrorResponse(res, 400, error.message);
    }
};

/*
 * คำอธิบาย : Schema สำหรับ validate ข้อมูลตอน "สร้าง Homestay แบบหลายรายการ (Bulk)" สำหรับ SuperAdmin
 * Input  : body (HomestayDto[]) — ต้องเป็นอาเรย์ที่มีอย่างน้อย 1 รายการ (ตรวจความว่างใน controller เพิ่มเติม)
 * Notice : เส้นทางจะมี params.communityId (ตรวจใน route/controller ไม่อยู่ใน DTO)
 * Routes : POST /super/community/:communityId/homestay/bulk
 * Output : commonDto object
*/
export const bulkCreateHomestayDto = {
    body: [HomestayDto],
} satisfies commonDto;

/*
 * POST /super/community/:communityId/homestay/bulk
 * สร้าง Homestay หลายรายการ (bulk) ภายใต้ชุมชนที่กำหนด
 * Input: params.communityId, body: HomestayDto[]
 * Output: 200 + รายการผลลัพธ์ที่สร้าง
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


/* *************************************** ทำไว้ชั่วคราวรอใช้ของเพื่อน กรณีเพื่อน pr มาแล้เ้ว ค่อยลบ
 * GET /super/homestays/:homestayId
 * ดูรายละเอียด Homestay รายการเดียว
 * Input: params.homestayId
 * Output: 200 + รายละเอียด
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

/*
 * คำอธิบาย : Schema สำหรับ validate ข้อมูลตอน "แก้ไข Homestay"
 * Input  : body (HomestayDto)  // หากมี Update DTO แยก ใช้แทนได้
 * Notice : เส้นทางจะมี params.homestayId (ตรวจใน route/controller ไม่อยู่ใน DTO)
 * Routes : PUT  /super/homestay/:homestayId
 * Output : commonDto object
*/
export const editHomestayDto = {
    body: HomestayDto,
} satisfies commonDto;

/*
 * PUT /super/homestay/:homestayId
 * (alias รองรับ) PATCH /super/homestays/:homestayId
 * แก้ไข Homestay
 * Input: params.homestayId, body: HomestayDto (หรือ partial ที่ validate แล้ว)
 * Output: 200 + updated entity
*/
export const editHomestay = async (req: Request, res: Response) => {
    try {
        if (!req.user) return createErrorResponse(res, 401, "Unauthorized");

        const id = Number(req.params.homestayId);
        if (!id) return createErrorResponse(res, 400, "ID must be a number");

        const files = req.files as {
            cover?: Express.Multer.File[];
            gallery?: Express.Multer.File[];
        };

        const isMultipart = req.is("multipart/form-data");

        // พาร์ส body
        let parsed: any;
        if (isMultipart) {
            if (!req.body?.data) {
                return createErrorResponse(res, 400, "ฟิลด์ 'data' (JSON string) ต้องถูกส่งมาใน multipart/form-data");
            }
            try {
                parsed = JSON.parse(req.body.data);
            } catch {
                return createErrorResponse(res, 400, "ฟิลด์ 'data' ไม่ใช่ JSON ที่ถูกต้อง");
            }
        } else {
            // รองรับ application/json ตรง ๆ
            parsed = req.body;
            if (!parsed || typeof parsed !== "object") {
                return createErrorResponse(res, 400, "Body ต้องเป็น JSON object");
            }
        }

        const homestayImage = [
            ...(files?.cover?.map(f => ({ image: f.path, type: "COVER" })) ?? []),
            ...(files?.gallery?.map(f => ({ image: f.path, type: "GALLERY" })) ?? []),
        ];

        const result = await HomestayService.editHomestayBySuperAdmin(
            Number(req.user.id),
            id,
            { ...parsed, homestayImage } // service ฝั่งคุณจะลบรูปเก่า+สร้างใหม่ให้แล้ว
        );

        return createResponse(res, 200, "Homestay Updated", result);
    } catch (error: any) {
        return createErrorResponse(res, 400, error.message);
    }
};

/*
 * DTO สำหรับ "ดึง Homestay ทั้งหมดในชุมชน"
 */
export class IdParamDto {
  @IsNumberString({}, { message: "communityId ต้องเป็นตัวเลข" })
  communityId?: string; // แก้เป็น optional
}

export const getHomestaysAllDto = { params: IdParamDto } satisfies commonDto;

/*
 * ฟังก์ชัน Controller สำหรับ "ดึง Homestay ทั้งหมดในชุมชน"
 */
export const getHomestaysAll: TypedHandlerFromDto<
  typeof getHomestaysAllDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const communityId = Number(req.params.communityId);
    const result = await HomestayService.getHomestaysAll(userId, communityId);
    return createResponse(res, 200, "get homestay successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
