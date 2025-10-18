import { IsNumberString } from "class-validator";
import {
    commonDto,
    type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import { StoreDto } from "~/Services/store/store-dto.js";
import * as StoreService from "~/Services/store/store-service.js";

/*
 * คำอธิบาย : DTO สำหรับดึงข้อมูลร้านค้าทั้งหมดของแอดมิน (เฉพาะในชุมชนของตนเอง)
 * Input :
 *   - query (page, limit)
 * Output : รายการข้อมูลร้านค้าทั้งหมดของแอดมิน พร้อม pagination
 */
export const getAllStoreForAdminDto = {
    query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getAllStoreForAdmin
 * อธิบาย : ดึงข้อมูลร้านค้าทั้งหมดที่อยู่ในชุมชนของผู้ใช้ที่มี role เป็น "admin"
 * Input :
 *   - req.user.id (จาก middleware auth)
 *   - req.query.page, req.query.limit
 * Output :
 *   - ร้านค้าทั้งหมดของแอดมินภายในชุมชนที่เขาสังกัด พร้อมข้อมูล pagination
 */
export const getAllStoreForAdmin: TypedHandlerFromDto<
    typeof getAllStoreForAdminDto
> = async (req, res) => {
    try {
        if (!req.user) {
            return createErrorResponse(res, 401, "Unauthorized: User not found");
        }

        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const result = await StoreService.getAllStoreForAdmin(userId, page, limit);
        return createResponse(res, 200, "All stores for admin", result);
    } catch (error: any) {
        return createErrorResponse(res, 400, error.message);
    }
};
