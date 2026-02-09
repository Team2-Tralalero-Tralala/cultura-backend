import { IsNumberString } from "class-validator";

import * as CommunityService from "~/Services/community/community-service.js";
import {
  CommunityDto,
  CommunityImageDto,
} from "~/Services/community/community-dto.js";

import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import { CommunityDetailPublicQueryDto } from "~/Libs/Types/communityDetailPublicQuery-dto.js";

/*
 * DTO : createCommunityDto
 * วัตถุประสงค์ : สำหรับสร้างข้อมูลชุมชนใหม่
 * Input : body (CommunityDto)
 * Output : ข้อมูลชุมชนที่ถูกสร้าง
 */
export const createCommunityDto = {
  body: CommunityDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Controller สำหรับสร้างข้อมูลชุมชนใหม่
 * Input :
 *   - req.body.data (JSON string) : ข้อมูลฟอร์มของชุมชน
 *   - req.files : ไฟล์แนบ (logo, cover, gallery, video)
 * Output :
 *   - JSON response พร้อมข้อมูลของชุมชนที่ถูกสร้างสำเร็จ
 */
export const createCommunity: TypedHandlerFromDto<
  typeof createCommunityDto
> = async (req, res) => {
  try {
    const files = req.files as {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
      video?: Express.Multer.File[];
    };
    const parsed = JSON.parse((req.body as any).data);

    const communityImage = [
      ...(files.logo?.[0] ? [{ image: files.logo[0].path, type: "LOGO" }] : []),

      ...(files.cover?.[0]
        ? [{ image: files.cover[0].path, type: "COVER" }]
        : []),

      ...(files.gallery?.map((file) => ({ image: file.path, type: "GALLERY" })) ||
        []),
      ...(files.video?.map((file) => ({ image: file.path, type: "VIDEO" })) || []),
    ];
    const result = await CommunityService.createCommunity({
      ...parsed,
      communityImage: communityImage as CommunityImageDto[],
    } as CommunityDto);
    return createResponse(res, 201, "Community created successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message, error.invalidMembers);
  }
};

/*
 * DTO : IdParamDto
 * วัตถุประสงค์ : สำหรับตรวจสอบค่า communityId ที่รับมาจาก params
 * Input : communityId (number)
 * Output : communityId ที่ถูกตรวจสอบแล้ว
 */
export class IdParamDto {
  @IsNumberString()
  communityId?: string;
}

/*
 * DTO : editCommunityDto
 * วัตถุประสงค์ : สำหรับแก้ไขข้อมูลของชุมชนที่มีอยู่
 * Input :
 *   - req.params.communityId : รหัสชุมชนที่ต้องการแก้ไข
 *   - req.body.data : ข้อมูลใหม่ของชุมชน
 *   - req.files : ไฟล์แนบ (logo, cover, gallery, video)
 * Output :
 *   - JSON response พร้อมข้อมูลชุมชนที่ถูกอัปเดตสำเร็จ
 */
export const editCommunityDto = {
  body: CommunityDto,
  params: IdParamDto,
} satisfies commonDto;
/*
 * คำอธิบาย : ฟังก์ชันสำหรับแก้ไขข้อมูลชุมชนที่มีอยู่
 * Input : req.params.communityId, req.body
 * Output : JSON response พร้อมข้อมูลชุมชนที่ถูกแก้ไข
 */
export const editCommunity: TypedHandlerFromDto<
  typeof editCommunityDto
> = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const files = req.files as {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
      video?: Express.Multer.File[];
    };
    const parsed = JSON.parse((req.body as any).data);

    const communityImage = [
      ...(files.logo?.[0] ? [{ image: files.logo[0].path, type: "LOGO" }] : []),

      ...(files.cover?.[0]
        ? [{ image: files.cover[0].path, type: "COVER" }]
        : []),

      ...(files.gallery?.map((file) => ({ image: file.path, type: "GALLERY" })) ||
        []),
      ...(files.video?.map((file) => ({ image: file.path, type: "VIDEO" })) || []),
    ];
    const result = await CommunityService.editCommunity(communityId, {
      ...parsed,
      communityImage: communityImage as CommunityImageDto[],
    } as CommunityDto);
    return createResponse(res, 200, "Update community successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message, error.invalidMembers);
  }
};

/*
 * DTO : deleteCommunityByIdDto
 * วัตถุประสงค์ : สำหรับลบข้อมูลชุมชนตาม communityId
 * Input : params (IdParamDto)
 * Output : ข้อมูลชุมชนที่ถูกลบ
 */
export const deleteCommunityByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบข้อมูลชุมชนตาม communityId
 * Input : req.params.communityId
 * Output : JSON response พร้อมข้อมูลชุมชนที่ถูกลบ
 */
export const deleteCommunityById: TypedHandlerFromDto<
  typeof deleteCommunityByIdDto
> = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const result = await CommunityService.deleteCommunityById(communityId);
    return createResponse(res, 200, "Deleted community successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * DTO : getCommunityByIdDto
 * วัตถุประสงค์ : สำหรับดึงข้อมูลชุมชนตามรหัส
 * Input : params (IdParamDto)
 * Output : ข้อมูลชุมชนที่ถูกดึง
 */
export const getCommunityByIdDto = { params: IdParamDto } satisfies commonDto;
/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลชุมชนตาม communityId
 * Input : req.params.communityId
 * Output : JSON response พร้อมข้อมูลชุมชนที่ถูกดึง
 */
export const getCommunityById: TypedHandlerFromDto<
  typeof getCommunityByIdDto
> = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const result = await CommunityService.getCommunityById(communityId);
    return createResponse(res, 200, "get community successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
/*
 * DTO : unassignedAdminsDto
 * วัตถุประสงค์ : สำหรับดึงแอดมินที่ยังไม่ถูกผูกกับชุมชน
 * Input : ไม่มี
 * Output : รายชื่อแอดมินที่ยังไม่ถูกผูกกับชุมชน
 */
export const unassignedAdminsDto = {} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายชื่อแอดมินที่ยังไม่ได้เป็นเจ้าของชุมชน
 * Input : ไม่มี
 * Output : JSON response พร้อมรายชื่อแอดมินที่ยังไม่ได้เป็นเจ้าของชุมชน
 */
export const getUnassignedAdmins: TypedHandlerFromDto<
  typeof unassignedAdminsDto
> = async (req, res) => {
  try {
    const result = await CommunityService.getUnassignedAdmins();
    return createResponse(res, 200, "fetch admin successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
/*
 * DTO : unassignedMemberDto
 * วัตถุประสงค์ : สำหรับดึงสมาชิกที่ยังไม่สังกัดชุมชน
 * Input : ไม่มี
 * Output : รายชื่อสมาชิกที่ยังไม่สังกัดชุมชน
 */
export const unassignedMemberDto = {} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายชื่อสมาชิกที่ยังไม่สังกัดชุมชน
 * Input : ไม่มี
 * Output : JSON response พร้อมรายชื่อสมาชิกที่ยังไม่สังกัดชุมชน
 */
export const getUnassignedMembers: TypedHandlerFromDto<
  typeof unassignedMemberDto
> = async (req, res) => {
  try {
    const result = await CommunityService.getUnassignedMembers();
    return createResponse(res, 200, "fetch member successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
/*
 * DTO : getCommunityAllDto
 * วัตถุประสงค์ : สำหรับดึงข้อมูลชุมชนทั้งหมด (รองรับ pagination)
 * Input : query (page, limit)
 * Output : รายการข้อมูลชุมชนทั้งหมด + pagination metadata
 */
export const getCommunityAllDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * อธิบาย : ดึง community ทั้งหมด (ใช้ได้เฉพาะ superadmin เท่านั้น)
 * Input : req.user.id (จาก middleware auth) และ req.query.page, req.query.limit
 * Output :
 *   - ถ้าเป็น superadmin → ได้ community ทั้งหมดพร้อม pagination
 *   - ถ้าไม่ใช่ superadmin → ได้ []
 */
export const getCommunityAll: TypedHandlerFromDto<
  typeof getCommunityAllDto
> = async (req, res) => {
  try {
    // ใช้ non-null assertion เพราะมั่นใจว่า middleware ใส่ req.user แน่ ๆ
    const userId = Number(req.user!.id);
    const { page = 1, limit = 10 } = req.query;

    const result = await CommunityService.getCommunityAll(userId, page, limit);
    return createResponse(res, 200, "All communities list", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/*
 * DTO : getCommunityDetailByIdDto
 * วัตถุประสงค์ : สำหรับดึงข้อมูลชุมชนตาม communityId
 * Input : params (IdParamDto)
 * Output : ข้อมูลชุมชนที่พบ
 */
export const getCommunityDetailByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลชุมชนตาม communityId
 * Input : req.user.id (userId จาก middleware auth), req.params.communityId
 * Output : JSON response พร้อมข้อมูลชุมชนที่พบ (เฉพาะ superadmin)
 */
export const getCommunityDetailById: TypedHandlerFromDto<
  typeof getCommunityDetailByIdDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const communityId = Number(req.params.communityId);
    const result = await CommunityService.getCommunityDetailById(
      userId,
      communityId
    );
    return createResponse(
      res,
      200,
      "Community detail retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * DTO : getCommunityDetailByAdminDto
 * วัตถุประสงค์ : สำหรับดึงรายละเอียดชุมชนของแอดมิน (ไม่ต้องมี params/query)
 * Input : ไม่มี (ใช้ req.user.id)
 * Output : รายละเอียดชุมชนของแอดมินคนนั้น
 */
export const getCommunityDetailByAdminDto = {} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายละเอียดชุมชนของแอดมินปัจจุบัน
 * Input : req.user.id
 * Output : JSON response พร้อมรายละเอียดชุมชน
 */
export const getCommunityDetailByAdmin: TypedHandlerFromDto<
  typeof getCommunityDetailByAdminDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const result = await CommunityService.getCommunityDetailByAdmin(userId);
    return createResponse(
      res,
      200,
      "Community detail (admin) retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

export const editCommunityByAdminyDto = {
  body: CommunityDto,
} satisfies commonDto;

export const editCommunityByAdmin: TypedHandlerFromDto<
  typeof editCommunityByAdminyDto
> = async (req, res) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    const files = req.files as {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
      video?: Express.Multer.File[];
    };
    const parsed = JSON.parse((req.body as any).data);

    const communityImage = [
      ...(files.logo?.[0] ? [{ image: files.logo[0].path, type: "LOGO" }] : []),

      ...(files.cover?.[0]
        ? [{ image: files.cover[0].path, type: "COVER" }]
        : []),

      ...(files.gallery?.map((file) => ({ image: file.path, type: "GALLERY" })) ||
        []),
      ...(files.video?.map((file) => ({ image: file.path, type: "VIDEO" })) || []),
    ];
    const result = await CommunityService.editCommunityByAdmin(req.user, {
      ...parsed,
      communityImage: communityImage as CommunityImageDto[],
    } as CommunityDto);
    return createResponse(res, 200, "Update community successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message, error.invalidMembers);
  }
};
/*
 * DTO : getCommunityOwnDto
 * วัตถุประสงค์ : สำหรับดึงข้อมูลชุมชนตามรหัส
 * Input : ไม่มี
 * Output : ข้อมูลชุมชนที่พบ
 */
export const getCommunityOwnDto = {} satisfies commonDto;
/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลชุมชนของตัวเอง
 * Input : ไม่มี
 * Output : JSON response พร้อมข้อมูลชุมชน
 */
export const getCommunityOwn: TypedHandlerFromDto<
  typeof getCommunityOwnDto
> = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const result = await CommunityService.getCommunityOwn(userId);
    return createResponse(res, 200, "get community successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * DTO : getCommunityDetailByMemberDto
 * วัตถุประสงค์ : สำหรับดึงรายละเอียดชุมชนของสมาชิก(ไม่ต้องมี params/query)
 * Input : ไม่มี (ใช้ req.user.id)
 * Output : รายละเอียดชุมชนของสมาชิกคนนั้น
 */
export const getCommunityDetailByMemberDto = {} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายละเอียดชุมชนของสมาชิก
 * Input : req.user.id
 * Output : JSON response พร้อมรายละเอียดชุมชน
 */
export const getCommunityDetailByMember: TypedHandlerFromDto<
  typeof getCommunityDetailByMemberDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const result = await CommunityService.getCommunityDetailByMember(userId);
    return createResponse(
      res,
      200,
      `Get Community detail member ${userId} successfully`,
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};


/**
 * คำอธิบาย : DTO สำหรับรับ communityId จาก path params
 * Input:
 *  - communityId : string (ต้องเป็นตัวเลขเท่านั้น)
 * Output:
 *  - ผ่าน validate แล้วจึงนำไปแปลงเป็น number ใน controller/service
 */

export class CommunityIdParamDto {
  @IsNumberString({}, { message: "communityId ต้องเป็นตัวเลขเท่านั้น" })
  communityId!: string;
}

/*
 * คำอธิบาย : DTO สำหรับดึงรายละเอียดชุมชนแบบ Public
 * ใช้สำหรับตรวจสอบและแปลงค่าข้อมูลที่ส่งเข้ามาจาก request
 * Input :
 *  - params : CommunityIdParamDto
 *      - communityId : รหัสชุมชน (ตัวเลข)
 *  - query  : CommunityDetailPublicQueryDto
 *      - packagePage / packageLimit   : pagination ของแพ็กเกจ
 *      - homestayPage / homestayLimit : pagination ของที่พัก
 *      - storePage / storeLimit       : pagination ของร้านค้า
 * Output :
 *  - Object สำหรับใช้งานร่วมกับ commonDto
 */
export const getCommunityDetailPublicDto = {
  params: CommunityIdParamDto,
  query: CommunityDetailPublicQueryDto,
} satisfies commonDto;

/**
 * คำอธิบาย : ดึงรายละเอียดชุมชนสำหรับหน้า public (guest/tourist) พร้อม pagination (package/homestay/store)
 * Input:
 *  - req.params.communityId
 *  - req.query: packagePage/packageLimit/storePage/storeLimit/homestayPage/homestayLimit
 * Output:
 *  - 200: ส่งข้อมูลรายละเอียดชุมชน + รายการ package/homestay/store พร้อม pagination
 *  - 400: ส่งข้อความ error
 */
export const getCommunityDetailPublic: TypedHandlerFromDto<
  typeof getCommunityDetailPublicDto
> = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);

    const {
      packagePage = 1,
      packageLimit = 8,
      storePage = 1,
      storeLimit = 12,
      homestayPage = 1,
      homestayLimit = 12,
    } = req.query;

    const result = await CommunityService.getCommunityDetailPublic({
      communityId,
      packagePage,
      packageLimit,
      storePage,
      storeLimit,
      homestayPage,
      homestayLimit,
    });

    return createResponse(res, 200, "Community detail (public)", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};