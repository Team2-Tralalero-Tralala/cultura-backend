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
 * ฟังก์ชัน : CommunityIdParamDto
 * รายละเอียด :
 *   ใช้ตรวจสอบค่าพารามิเตอร์ communityId จาก URL
 *   เพื่อให้แน่ใจว่าเป็นตัวเลขเท่านั้น
 */
export class CommunityIdParamDto {
  @IsNumberString()
  communityId?: string;
}

/*
 * คำอธิบาย : DTO สำหรับดึงข้อมูลร้านค้าทั้งหมด (รองรับ pagination)
 * Input :
 *   - query (page, limit)
 *   - req.params.communityId : string (รหัสชุมชน)
 * Output : รายการข้อมูลร้านค้าทั้งหมดของชุมชนนั้น
 */
export const getAllStoreDto = {
    query: PaginationDto,
    params: CommunityIdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getAllStore
 * อธิบาย : ดึง ข้อมูลร้านค้า ทั้งหมด ของ superadmin โดยดึงจาก Id ของ Community
 * Input : req.params.communityId
 * Output : ร้านค้าทั้งหมด
 */
export const getAllStore: TypedHandlerFromDto<
    typeof getAllStoreDto
> = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const { page = 1, limit = 10 } = req.query;

        const result = await StoreService.getAllStore(communityId, page, limit);
        return createResponse(res, 200, "All stores in Community", result);
    } catch (error: any) {
        return createErrorResponse(res, 400, error.message);
    }
};