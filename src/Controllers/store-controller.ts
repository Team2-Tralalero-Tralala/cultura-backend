import { IsNumberString } from "class-validator";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import { StoreDto, StoreImageDto } from "~/Services/store/store-dto.js";
import * as StoreService from "~/Services/store/store-service.js";

/**
 * DTO : CommunityIdParamDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับดึงข้อมูลร้านค้าทั้งหมดในชุมชน
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export class CommunityIdParamDto {
  @IsNumberString()
  communityId?: string;
}

/*
 * DTO : createStoreDto
 * คำอธิบาย : ฟังก์ชันใช้กำหนดโครงสร้างข้อมูล (DTO) สำหรับสร้างร้านค้าใหม่
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
 * คำอธิบาย :
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

    const files = req.files as {
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    };

    const parsed = JSON.parse((req.body as any).data);
    const storeImage = [
      ...(files.cover?.map((file) => ({ image: file.path, type: "COVER" })) || []),
      ...(files.gallery?.map((file) => ({ image: file.path, type: "GALLERY" })) ||
        []),
    ];

    const result = await StoreService.createStore(
      { ...parsed, storeImage: storeImage as StoreImageDto[] },
      communityId
    );

    return createResponse(res, 201, "Store created successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/**
 * DTO : IdParamDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับดึงข้อมูลร้านค้าทั้งหมดในชุมชน
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export class IdParamDto {
  @IsNumberString()
  storeId?: string;
}
/*
 * DTO : editStoreDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับแก้ไขร้านค้า
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const editStoreDto = {
  body: StoreDto,
  params: IdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย :
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

    const parsed = JSON.parse((req.body as any).data);
    const storeImage = [
      ...(files.cover?.map((file) => ({ image: file.path, type: "COVER" })) || []),
      ...(files.gallery?.map((file) => ({ image: file.path, type: "GALLERY" })) ||
        []),
    ];

    const storeId = Number(req.params.storeId);
    const result = await StoreService.editStore(
      storeId,
      { ...parsed, storeImage: storeImage as StoreImageDto[] },
      req.user
    );

    return createResponse(res, 200, "Store updated successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/**
 * DTO : getStoreByIdDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับดึงข้อมูลร้านค้าทั้งหมดในชุมชน
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const getStoreByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/**
 * คำอธิบาย :
 *   ดึงข้อมูลร้านค้าตาม storeId
 * Input :
 *   - req.params.storeId : string (รหัสร้านค้า)
 * Output :
 *   - 200 : ดึงข้อมูลร้านค้าสำเร็จ
 *   - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 *   - 401 : ผู้ใช้ยังไม่ได้รับการยืนยันตัวตน
 */
export const getStoreById: TypedHandlerFromDto<typeof getStoreByIdDto> = async (
  req,
  res
) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    const storeId = Number(req.params.storeId);
    const result = await StoreService.getStoreById(storeId, req.user);
    return createResponse(res, 200, "Get store successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : getAllStoreDto
 * วัตถุประสงค์ : กำหนดโครงสร้างข้อมูล (DTO) สำหรับดึงข้อมูลร้านค้าทั้งหมดในชุมชน
 * Input :
 *   - query : PaginationDto
 *   - params : CommunityIdParamDto
 * Output :
 *   - รายการข้อมูลร้านค้าทั้งหมด
 */
export const getAllStoreDto = {
  query: PaginationDto,
  params: CommunityIdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้าทั้งหมดในชุมชนตามหน้าและจำนวนที่ระบุ
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
    const { page = 1, limit = 10, search } = req.query;
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }
    const result = await StoreService.getAllStore(
      req.user.role,
      communityId,
      page,
      limit,
      search ? String(search) : undefined
    );
    return createResponse(
      res,
      200,
      "Get all stores in community Successfully",
      result
    );
  } catch (error: any) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย :
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
    const parsed = JSON.parse((req.body as any).data);

    // รวมไฟล์พร้อม type
    const storeImage = [
      ...(files.cover?.map((file) => ({ image: file.path, type: "COVER" })) || []),
      ...(files.gallery?.map((file) => ({ image: file.path, type: "GALLERY" })) ||
        []),
    ];

    const result = await StoreService.createStoreByAdmin(
      { ...parsed, storeImage: storeImage as StoreImageDto[] },
      req.user
    );

    return createResponse(res, 201, "Store created successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : getAllStoreForAdminDto
 * วัตถุประสงค์ : สำหรับดึงข้อมูลร้านค้าทั้งหมดของแอดมิน เฉพาะในชุมชนของตนเอง
 * Input :
 *   - query (page, limit)
 * Output : รายการข้อมูลร้านค้าทั้งหมดของแอดมิน พร้อม pagination
 */
export const getAllStoreForAdminDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้าทั้งหมดที่อยู่ในชุมชนของผู้ใช้ที่มี role เป็น "admin"
 * Input :
 *   - req.user.id (จาก middleware auth)
 *   - req.query.page, req.query.limit
 * Output :
 *   - 401 : ผู้ใช้ยังไม่ได้รับการยืนยันตัวตน
 *   - 200 : ดึงข้อมูลร้านค้าสำเร็จ
 *   - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 */
export const getAllStoreForAdmin: TypedHandlerFromDto<
  typeof getAllStoreForAdminDto
> = async (req, res) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }
    const userId = req.user.id;
    const { page = 1, limit = 10, search } = req.query;

    const result = await StoreService.getAllStoreForAdmin(
      userId,
      page,
      limit,
      search ? String(search) : undefined
    );
    return createResponse(
      res,
      200,
      "Get all stores for admin successfully",
      result
    );
  } catch (error: any) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย :
 *   ลบร้านค้าออกจากระบบ (แบบ Soft Delete)
 *   โดยจำกัดสิทธิ์เฉพาะผู้ใช้ที่เป็น superadmin หรือ admin เท่านั้น
 *   ตรวจสอบสิทธิ์ผ่าน middleware ก่อนดำเนินการ
 * Input :
 *   - req.params.storeId : หมายเลขรหัสร้านค้า (string → number)
 *   - req.user            : ข้อมูลผู้ใช้จาก token (UserPayload)
 * Output :
 *   - 200 : ลบร้านค้าสำเร็จ พร้อมส่งข้อมูลร้านที่ถูกลบกลับ
 *   - 400 : ไม่พบร้านค้าหรือผู้ใช้ไม่มีสิทธิ์
 *   - 401 : ผู้ใช้ไม่ได้รับการยืนยันตัวตน
 */
export const deleteStoreDto = {
  params: IdParamDto,
} satisfies commonDto;

export const deleteStore: TypedHandlerFromDto<typeof deleteStoreDto> = async (
  req,
  res
) => {
  try {
    // 🔹 ตรวจสอบสิทธิ์ผู้ใช้งาน
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    // 🔹 แปลง storeId จากพารามิเตอร์เป็นตัวเลข
    const storeId = Number(req.params.storeId);

    // 🔹 เรียกใช้ Service สำหรับลบร้านค้า
    const result = await StoreService.deleteStore(storeId, req.user);

    // 🔹 ตอบกลับผลลัพธ์สำเร็จ
    return createResponse(res, 200, "Store deleted successfully", result);
  } catch (error: any) {
    // 🔹 ส่งข้อความ error กลับในกรณีล้มเหลว
    return createErrorResponse(res, 400, error.message);
  }
};
/*
 * DTO : deleteStoreByAdminDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับลบร้านค้า
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
class DeleteStoreParamsDto {
  @IsNumberString()
  id?: string;
}

/*
 * DTO : deleteStoreByAdminDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับลบร้านค้า
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const deleteStoreByAdminDto = {
  params: DeleteStoreParamsDto,
} satisfies commonDto;

/*
 * คำอธิบาย :
 *   ลบร้านค้าออกจากระบบ (แบบ Soft Delete)
 *   โดยจำกัดสิทธิ์เฉพาะผู้ใช้ที่เป็น superadmin หรือ admin เท่านั้น
 *   ตรวจสอบสิทธิ์ผ่าน middleware ก่อนดำเนินการ
 * Input :
 *   - req.params.storeId : หมายเลขรหัสร้านค้า (string → number)
 *   - req.user            : ข้อมูลผู้ใช้จาก token (UserPayload)
 * Output :
 *   - 200 : ลบร้านค้าสำเร็จ พร้อมส่งข้อมูลร้านที่ถูกลบกลับ
 *   - 400 : ไม่พบร้านค้าหรือผู้ใช้ไม่มีสิทธิ์
 */
export const deleteStoreByAdmin: TypedHandlerFromDto<
  typeof deleteStoreByAdminDto
> = async (req, res) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "Unauthorized: User not found");
    }

    const userId = req.user.id;
    const storeId = Number(req.params.id);

    const result = await StoreService.deleteStoreByAdmin(userId, storeId);
    return createResponse(res, 200, "Store deleted successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/**
 * DTO : CommunityAndStoreParamDto
 * วัตถุประสงค์ : ใช้สำหรับตรวจสอบพารามิเตอร์ communityId และ storeId
 * Input :
 *   - communityId : string (รหัสชุมชน)
 *   - storeId : string (รหัสร้านค้า)
 * Output : หากข้อมูลถูกต้อง จะอนุญาตให้ดำเนินการต่อ แต่หากไม่ถูกต้อง จะส่งข้อผิดพลาดกลับ
 */
export class CommunityAndStoreParamDto {
  @IsNumberString()
  communityId?: string;

  @IsNumberString()
  storeId?: string;
}

/* DTO : getStoreWithOtherStoresInCommunityDto
 * วัตถุประสงค์ : ใช้สำหรับตรวจสอบพารามิเตอร์และคิวรีสำหรับฟังก์ชัน getStoreWithOtherStoresInCommunity
 * Input :
 *   - params : CommunityAndStoreParamDto (ตรวจสอบ communityId และ storeId)
 *   - query : PaginationDto (ตรวจสอบ page และ limit)
 * Output : หากข้อมูลถูกต้อง จะอนุญาตให้ดำเนินการต่อ แต่หากไม่ถูกต้อง จะส่งข้อผิดพลาดกลับ
 */
export const getStoreWithOtherStoresInCommunityDto = {
  params: CommunityAndStoreParamDto,
  query: PaginationDto,
} satisfies commonDto;

/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้ารายละเอียดพร้อมร้านค้าอื่นๆ ในชุมชนเดียวกัน
 * Input :
 *  - req.params.communityId : string (รหัสชุมชน)
 *  - req.params.storeId : string (รหัสร้านค้า)
 *  - req.query.page : number (หมายเลขหน้าที่ต้องการ, ค่าเริ่มต้น 1)
 *  - req.query.limit : number (จำนวนรายการต่อหน้า, ค่าเริ่มต้น 12)
 * Output :
 *   - 200 : ดึงข้อมูลร้านค้าและร้านค้าอื่นๆ สำเร็จ พร้อมผลลัพธ์
 *   - 400 : ข้อมูลไม่ถูกต้อง หรือเกิดข้อผิดพลาด
 */
export const getStoreWithOtherStoresInCommunity: TypedHandlerFromDto<
  typeof getStoreWithOtherStoresInCommunityDto
> = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const storeId = Number(req.params.storeId);

    const { page = 1, limit = 12 } = req.query;

    const result = await StoreService.getStoreWithOtherStoresInCommunity(
      communityId,
      storeId,
      page,
      limit
    );
    return createResponse(
      res,
      200,
      "Get store detail with other stores successfully",
      result
    );
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/**
 * DTO : storeDto
 * วัตถุประสงค์ : ใช้เป็น DTO สำหรับการเรียกดูข้อมูลรายละเอียดร้านค้า
 * Input : ไม่มี (รับค่าพารามิเตอร์จาก URL)
 * Output : ใช้สำหรับตรวจสอบโครงสร้างข้อมูลก่อนเรียก Controller
 */
export const storeDto = {} satisfies commonDto;

/**
 * คำอธิบาย : (Admin) Handler สำหรับดึงข้อมูลร้านค้าตาม ID
 * Input : รหัสร้านค้าจาก URL path (req.params.id)
 * Output : ดึงข้อมูลสำเร็จ (Response 200), กรณีไม่พบข้อมูลร้านค้า (Response 404), กรณีข้อมูลไม่ถูกต้องหรือเกิดข้อผิดพลาด (Response 400)
 */
export const getStoreByIdShared: TypedHandlerFromDto<typeof storeDto> = async (
  req,
  res
) => {
  try {
    const { id } = req.params as { id?: string };
    if (!id) {
      return createErrorResponse(res, 400, "Missing store id in URL path");
    }

    const storeId = Number(id);
    if (Number.isNaN(storeId)) {
      return createErrorResponse(res, 400, "Invalid store id format");
    }

    const result = await StoreService.getStoreByIdShared(storeId);
    if (!result) {
      return createErrorResponse(res, 404, "Store not found");
    }

    return createResponse(res, 200, "Fetched store successfully", result);
  } catch (error) {
    console.error("Error in getStoreById:", error);
    return createErrorResponse(res, 400, "Internal server error");
  }
};
