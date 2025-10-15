import { IsNumberString } from "class-validator";

import * as CommunityService from "~/Services/community/community-service.js";
import { CommunityDto } from "~/Services/community/community-dto.js";

import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/*
 * คำอธิบาย : DTO สำหรับสร้างข้อมูลชุมชนใหม่
 * Input : body (CommunityDto)
 * Output : ข้อมูลชุมชนที่ถูกสร้าง
 */
export const createCommunityDto = {
  body: CommunityDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างข้อมูลชุมชนใหม่
 * Input : req.body (community, location, homestay, store, member)
 * Output : JSON response พร้อมข้อมูลชุมชนที่ถูกสร้าง
 */
export const createCommunity: TypedHandlerFromDto<
  typeof createCommunityDto
> = async (req, res) => {
  try {
    const result = await CommunityService.createCommunity(req.body);
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
 * คำอธิบาย : DTO สำหรับแก้ไขข้อมูลชุมชน
 * Input : body (editCommunityDto), params (IdParamDto)
 * Output : ข้อมูลชุมชนที่ถูกแก้ไข
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
    const result = await CommunityService.editCommunity(communityId, req.body);
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
