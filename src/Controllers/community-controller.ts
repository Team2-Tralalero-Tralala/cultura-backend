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

/*
 * คำอธิบาย : DTO สำหรับสร้างข้อมูลชุมชนใหม่
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
 * หมายเหตุ :
 *   - ใช้ multipart/form-data ในการส่งข้อมูล
 *   - แนบไฟล์จาก Multer ไปสร้าง communityImage[]
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

      ...(files.gallery?.map((f) => ({ image: f.path, type: "GALLERY" })) ||
        []),
      ...(files.video?.map((f) => ({ image: f.path, type: "VIDEO" })) || []),
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
 * คำอธิบาย : DTO สำหรับตรวจสอบค่า communityId ที่รับมาจาก params
 * Input : communityId (number)
 * Output : communityId ที่ถูกตรวจสอบแล้ว
 */
export class IdParamDto {
  @IsNumberString()
  communityId?: string;
}

/*
 * คำอธิบาย : Controller สำหรับแก้ไขข้อมูลของชุมชนที่มีอยู่
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

      ...(files.gallery?.map((f) => ({ image: f.path, type: "GALLERY" })) ||
        []),
      ...(files.video?.map((f) => ({ image: f.path, type: "VIDEO" })) || []),
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
 * คำอธิบาย : DTO สำหรับลบข้อมูลชุมชนตาม communityId
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
 * DTO สำหรับ "ดึงข้อมูลชุมชนตามรหัส"
 */
export const getCommunityByIdDto = { params: IdParamDto } satisfies commonDto;
/*
 * ฟังก์ชัน Controller สำหรับ "ดึงข้อมูลชุมชนตามรหัส"
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
 * DTO สำหรับ "ดึงแอดมินที่ยังไม่ถูกผูกกับชุมชน"
 */
export const unassignedAdminsDto = {} satisfies commonDto;

/*
 * ฟังก์ชัน Controller สำหรับ "ดึงรายชื่อแอดมินที่ยังไม่ได้เป็นเจ้าของชุมชน"
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
 * DTO สำหรับ "ดึงสมาชิกที่ยังไม่สังกัดชุมชน"
 */
export const unassignedMemberDto = {} satisfies commonDto;

/*
 * ฟังก์ชัน Controller สำหรับ "ดึงรายชื่อสมาชิกที่ยังไม่สังกัดชุมชน"
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
 * คำอธิบาย : DTO สำหรับดึงข้อมูลชุมชนทั้งหมด (รองรับ pagination)
 * Input : query (page, limit)
 * Output : รายการข้อมูลชุมชนทั้งหมด + pagination metadata
 */
export const getCommunityAllDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getCommunityAll
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
 * คำอธิบาย : DTO สำหรับดึงข้อมูลชุมชนตาม communityId
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
 * คำอธิบาย : DTO สำหรับดึงรายละเอียดชุมชนของแอดมิน (ไม่ต้องมี params/query)
 * Input : ไม่มี (ใช้ req.user.id)
 * Output : รายละเอียดชุมชนของแอดมินคนนั้น
 */
export const getCommunityDetailByAdminDto = {} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายละเอียดชุมชนของแอดมินปัจจุบัน
 * Route : GET /admin/community
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

      ...(files.gallery?.map((f) => ({ image: f.path, type: "GALLERY" })) ||
        []),
      ...(files.video?.map((f) => ({ image: f.path, type: "VIDEO" })) || []),
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
 * DTO สำหรับ "ดึงข้อมูลชุมชนตามรหัส"
 */
export const getCommunityOwnDto = {} satisfies commonDto;
/*
 * ฟังก์ชัน Controller สำหรับ "ดึงข้อมูลชุมชนตามรหัส"
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
 * คำอธิบาย : DTO สำหรับดึงรายละเอียดชุมชนของสมาชิก(ไม่ต้องมี params/query)
 * Input : ไม่มี (ใช้ req.user.id)
 * Output : รายละเอียดชุมชนของสมาชิกคนนั้น
 */
export const getCommunityDetailByMemberDto = {} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายละเอียดชุมชนของสมาชิก
 * Route : GET /member/community
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
