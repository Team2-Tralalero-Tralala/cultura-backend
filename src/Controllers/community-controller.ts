import { IsInt } from "class-validator";
import { Type } from "class-transformer";

import * as CommunityService from "~/Services/community/community-service.js";
import {
  CommunityFormDto,
  updateCommunityFormDto,
} from "~/Services/community/community-dto.js";

import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/*
 * คำอธิบาย : DTO สำหรับสร้างข้อมูลชุมชนใหม่
 * Input : body (CommunityFormDto)
 * Output : ข้อมูลชุมชนที่ถูกสร้าง
 */
export const createCommunityDto = {
  body: CommunityFormDto,
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
    const { location, homestay, store, member, ...community } = req.body;
    const result = await CommunityService.createCommunity(
      community,
      location,
      homestay,
      store,
      member
    );
    return createResponse(res, 201, "Community created successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : DTO สำหรับตรวจสอบค่า communityId ที่รับมาจาก params
 * Input : communityId (number)
 * Output : communityId ที่ถูกตรวจสอบแล้ว
 */
export class IdParamDto {
  @Type(() => Number)
  @IsInt()
  communityId: number;
}

/*
 * คำอธิบาย : DTO สำหรับแก้ไขข้อมูลชุมชน
 * Input : body (updateCommunityFormDto), params (IdParamDto)
 * Output : ข้อมูลชุมชนที่ถูกแก้ไข
 */
export const editCommunityDto = {
  body: updateCommunityFormDto,
  params: IdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแก้ไขข้อมูลชุมชนที่มีอยู่
 * Input : req.params.communityId, req.body (community, location)
 * Output : JSON response พร้อมข้อมูลชุมชนที่ถูกแก้ไข
 */
export const editCommunity: TypedHandlerFromDto<
  typeof editCommunityDto
> = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const { location, ...community } = req.body;
    const result = await CommunityService.editCommunity(
      communityId,
      community,
      location
    );
    return createResponse(res, 201, "Update community successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
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
    return createResponse(res, 201, "Deleted community successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
