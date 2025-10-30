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
 * ฟังก์ชัน : createStoreDto
 * รายละเอียด :
 *   ใช้กำหนดโครงสร้างข้อมูล (DTO) สำหรับสร้างร้านค้าใหม่
 * Input :
 *   - params : CommunityIdParamDto
 *   - body : StoreDto
 * Output :
 *   - ข้อมูลร้านค้าที่สร้างสำเร็จ
 */
export const createStoreDto = {
  body: StoreDto,
  params: CommunityIdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : createStore
 * รายละเอียด :
 *   รับข้อมูลร้านค้าใหม่จากผู้ใช้ แล้วส่งต่อให้ StoreService.createStore
 *   เพื่อลงฐานข้อมูล พร้อมตรวจสอบสิทธิ์ผู้ใช้งาน
 * Input :
 *   - req.body : StoreDto (ข้อมูลร้านค้าใหม่)
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
export const editStoreDto = {
  body: StoreDto,
  params: IdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : editStore
 * รายละเอียด :
 *   อัปเดตรายละเอียดร้านค้า เช่น ชื่อ ที่อยู่ รูปภาพ และป้ายกำกับ
 *   โดยตรวจสอบสิทธิ์ก่อนแก้ไข
 * Input :
 *   - req.params.storeId : string (รหัสร้านค้า)
 *   - req.body : StoreDto (ข้อมูลร้านค้าใหม่)
 * Output :
 *   - 201 : แก้ไขข้อมูลสำเร็จ
 *   - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 *   - 401 : ผู้ใช้ยังไม่ได้รับการยืนยันตัวตน
 */
export const editStore: TypedHandlerFromDto<typeof editStoreDto> = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "ผู้ใช้ยังไม่ได้รับการยืนยันตัวตน");
    }
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
      return createErrorResponse(res, 401, "ผู้ใช้ยังไม่ได้รับการยืนยันตัวตน");
    }
    const storeId = Number(req.params.storeId);
    const result = await StoreService.getStoreById(storeId, req.user);
    return createResponse(res, 201, "Store update successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * ฟังก์ชัน : getAllStoreDto
 * รายละเอียด :
 *   ใช้กำหนดโครงสร้างข้อมูล (DTO) สำหรับดึงข้อมูลร้านค้า
 * Input :
 *   - query : PaginationDto
 *   - params : CommunityIdParamDto
 * Output :
 *   - รายการข้อมูลร้านค้าทั้งฟมด
 */
export const getAllStoreDto = {
  query: PaginationDto,
  params: CommunityIdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getAllStore
 * รายละเอียด :
 *   ดึงข้อมูลร้านค้าทั้งหมดในชุมชนตามหน้าและจำนวนที่ระบุ
 *   ตรวจสอบสิทธิ์ของผู้ใช้ก่อนเข้าถึงข้อมูล
 * Input :
 *   - req.params.communityId : string (รหัสชุมชน)
 *   - req.query.page : number (หมายเลขหน้าที่ต้องการ, ค่าเริ่มต้น 1)
 *   - req.query.limit : number (จำนวนรายการต่อหน้า, ค่าเริ่มต้น 10)
 * Output :
 *   - 200 : ดึงข้อมูลร้านค้าสำเร็จ พร้อมผลลัพธ์
 *   - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 *   - 401 : ผู้ใช้ยังไม่ได้รับการยืนยันตัวตน
 */
export const getAllStore: TypedHandlerFromDto<typeof getAllStoreDto> = async (
  req,
  res
) => {
  try {
    const communityId = Number(req.params.communityId);
    const { page = 1, limit = 10 } = req.query;
    if (!req.user) {
      return createErrorResponse(res, 400, "ไม่พบ role");
    }
    const result = await StoreService.getAllStore(
      req.user.role,
      communityId,
      page,
      limit
    );
    return createResponse(res, 200, "All stores in Community", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * ฟังก์ชัน : createStore
 * รายละเอียด :
 *   รับข้อมูลร้านค้าใหม่จากผู้ใช้ แล้วส่งต่อให้ StoreService.createStore
 *   เพื่อลงฐานข้อมูล พร้อมตรวจสอบสิทธิ์ผู้ใช้งาน
 * Input :
 *   - req.body : StoreDto (ข้อมูลร้านค้าใหม่)
 *   - req.params.communityId : string (รหัสชุมชน)
 * Output :
 *   - 201 : ร้านค้าสร้างสำเร็จ พร้อมข้อมูลที่สร้าง
 *   - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 *   - 401 : ผู้ใช้ยังไม่ได้รับการยืนยันตัวตน
 */
export const createStoreByAdmin: TypedHandlerFromDto<
  typeof createStoreDto
> = async (req, res) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }
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

    const result = await StoreService.createStoreByAdmin(
      { ...parsed, storeImage },
      req.user
    );

    return createResponse(res, 201, "Store created successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};
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
export const getAllStoreForAdmin: TypedHandlerFromDto<typeof getAllStoreForAdminDto> = async (
  req, 
  res
) => {
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

