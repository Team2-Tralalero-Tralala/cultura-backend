import { IsNumberString } from "class-validator";

import * as CommunityService from "~/Services/community/community-service.js";
import { CommunityDto, QueryListHomestaysDto, QueryListMembersDto } from "~/Services/community/community-dto.js";

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

export const getCommunityByIdDto = { params: IdParamDto } satisfies commonDto;

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

export const unassignedAdminsDto = {} satisfies commonDto;

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

export const unassignedMemberDto = {} satisfies commonDto;

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


export const listCommunityMembersDto = {
  query: QueryListMembersDto,
} satisfies commonDto;

export const listCommunityMembers: TypedHandlerFromDto<
  typeof listCommunityMembersDto
> = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const { q = "", limit = 10 } = req.query;

    const data = await CommunityService.listCommunityMembers({
      userId,
      q,
      limit: Number(limit),
    });

    return createResponse(res, 200, "fetch members successfully", data);
  } catch (err) {
    return createErrorResponse(res, 400, (err as Error).message);
  }
};

export const listCommunityHomestaysDto = {
  query: QueryListHomestaysDto,
} satisfies commonDto;

// Handler
export const listCommunityHomestays: TypedHandlerFromDto<
  typeof listCommunityHomestaysDto
> = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const { q = "", limit = 8 } = req.query;

    const data = await CommunityService.listCommunityHomestays({
      userId,
      q,
      limit: Number(limit),
    });

    return createResponse(res, 200, "fetch homestays successfully", data);
  } catch (err) {
    return createErrorResponse(res, 400, (err as Error).message);
  }
};