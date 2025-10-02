import type { Request, Response } from "express";
import * as CommunityService from "../Services/community/community-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/*
 * ฟังก์ชัน: getCommunityById (Controller)
 * คำอธิบาย: ใช้สำหรับจัดการ request/response ในการดึงข้อมูลชุมชนตามรหัส (id) 
 * Input:
 *   - req.params.id (number): รหัสชุมชนจากพารามิเตอร์ของ URL
 *   - req (Request): ออบเจกต์ request ของ Express
 *   - res (Response): ออบเจกต์ response ของ Express
 * Output:
 *   - Response JSON: 
 *       - status: 200 และข้อมูลชุมชน หากพบ
 *       - status: 404 และข้อความ error หากไม่พบ
 * Error:
 *   - จัดการ error ผ่าน createErrorResponse หากเกิดข้อผิดพลาด เช่น ไม่พบชุมชน
 */
export const getCommunityById = async (req: Request, res: Response) => {
    try {
        const community = await CommunityService.getCommunityById(Number(req.params.id));
        return createResponse(res, 200, "Community getById successfully", community);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

/*
 * ฟังก์ชัน : getCommunityByMe
 * Input : req.user.id - ข้อมูล userId ที่ middleware auth ใส่มาให้
 * Output :
 *   - 200 OK พร้อมข้อมูล community ที่ผู้ใช้มีสิทธิ์เข้าถึง (admin/member)
 *   - 400 Bad Request ถ้ามี error ที่สามารถคาดเดาได้
 */
export const getCommunityByMe = async (req: Request, res: Response) => { 
  try {
    const userId = Number(req.user.id);
      const { page = 1, limit = 10 } = req.query;

    const result = await CommunityService.getCommunityByMe(userId, Number(page), Number(limit));
    return createResponse(res, 200, "Community list by role", result);

  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};


/*
 * ฟังก์ชัน : getCommunityAll
 * Input : req.user.id - ข้อมูล userId ที่ middleware auth ใส่มาให้
 * Output :
 *   - 200 OK พร้อมข้อมูล community ทั้งหมด (สำหรับ superadmin)
 *   - 400 Bad Request ถ้ามี error ที่ตรวจสอบได้
 */
export const getCommunityAll = async (req: Request, res: Response) => { 
  try {
    const userId = Number(req.user.id);
    const { page = 1, limit = 10 } = req.query;
    const result = await CommunityService.getCommunityAll(userId, Number(page), Number(limit));
    return createResponse(res, 200, "All communities list", result);
    
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
