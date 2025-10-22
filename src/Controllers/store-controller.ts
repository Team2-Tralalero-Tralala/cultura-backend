import { IsNumberString } from "class-validator";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import { StoreDto } from "~/Services/store/store-dto.js";
import * as StoreService from "~/Services/store/store-service.js";
import {
    commonDto,
    type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

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
 * Output :
 *   - 201 : ร้านค้าสร้างสำเร็จ พร้อมข้อมูลที่สร้าง
 *   - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 *   - 401 : ผู้ใช้ยังไม่ได้รับการยืนยันตัวตน
 */
export const createStore: TypedHandlerFromDto<typeof createStoreDto> = async (
  req,
  res
) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    const communityId = Number(req.params.communityId);

    // รับไฟล์จาก multer
    const files = req.files as {
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    };

    // แปลง body JSON ที่แนบมาใน "data"
    const parsed = JSON.parse(req.body.data);

    // รวมไฟล์พร้อม type
    const storeImage = [
      ...(files.cover?.map((f) => ({ image: f.path, type: "COVER" })) || []),
      ...(files.gallery?.map((f) => ({ image: f.path, type: "GALLERY" })) ||
        []),
    ];

    const result = await StoreService.createStore(
      { ...parsed, storeImage },
      req.user,
      communityId
    );

    return createResponse(res, 201, "Store created successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * ฟังก์ชัน : IdParamDto
 * รายละเอียด :
 *   ใช้ตรวจสอบค่าพารามิเตอร์ storeId จาก URL
 */
export class IdParamDto {
  @IsNumberString()
  storeId?: string;
}
/*
 * ฟังก์ชัน : editStoreDto
 * รายละเอียด :
 *   ใช้กำหนดโครงสร้างข้อมูล (DTO) สำหรับแก้ไขร้านค้า
 * Input :
 *   - params : IdParamDto
 *   - body : StoreDto
 * Output :
 *   - ข้อมูลร้านค้าที่อัปเดตแล้ว
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
        const userId = Number(req.user!.id)
        const communityId = Number(req.params.communityId);
        const result = await StoreService.getAllStore(userId, communityId);
        return createResponse(res, 200, "get store successfully", result);
    } catch (error) {
        return createErrorResponse(res, 400, (error as Error).message);
    }
};
    // รับไฟล์จาก multer
    const files = req.files as {
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    };

    // แปลง body JSON ที่แนบมาใน "data"
    const parsed = JSON.parse(req.body.data);

    // รวมไฟล์พร้อม type
    const storeImage = [
      ...(files.cover?.map((f) => ({ image: f.path, type: "COVER" })) || []),
      ...(files.gallery?.map((f) => ({ image: f.path, type: "GALLERY" })) ||
        []),
    ];
    console.log(files);
    const storeId = Number(req.params.storeId);
    const result = await StoreService.editStore(
      storeId,
      { ...parsed, storeImage },
      req.user
    );
    return createResponse(res, 201, "Store update successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

export const getStoreByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

export const getStoreById: TypedHandlerFromDto<typeof getStoreByIdDto> = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }
    const storeId = Number(req.params.storeId);
    const result = await StoreService.getStoreById(storeId);
    return createResponse(res, 201, "Store update successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};
