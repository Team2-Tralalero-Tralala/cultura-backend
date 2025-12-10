/*
 * คำอธิบาย : Controller สำหรับการจัดการ Tag
 * ประกอบด้วยการสร้าง (create), แก้ไข (edit), ลบ (delete), และดึงข้อมูล Tag ทั้งหมด(get)
 * โดยใช้ TagService ในการทำงานหลัก และส่งผลลัพธ์กลับด้วย createResponse / createErrorResponse
 */
import { IsNumberString } from "class-validator";
import * as TagService from "../Services/tag/tag-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { PaginationDto } from "~/Services/pagination-dto.js";

import { TagDto } from "~/Services/tag/tag-dto.js";

import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

/*
 * คำอธิบาย : DTO สำหรับสร้างข้อมูลTagใหม่
 * Input : body (TagDto)
 * Output : ข้อมูลTagที่ถูกสร้าง
 */
export const createTagDto = {
  body: TagDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : createTag
 * คำอธิบาย : Handler สำหรับสร้าง Tag ใหม่
 * Input : req.body - ข้อมูล Tag จาก client
 * Output :
 *   - 200 Created พร้อมข้อมูล Tag ที่สร้างใหม่
 *   - 400 Bad Request ถ้ามี error
 */
export const createTag: TypedHandlerFromDto<typeof createTagDto> = async (
  req,
  res
) => {
  try {
    const result = await TagService.createTag(req.body);
    return createResponse(res, 200, "Tag created successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : DTO สำหรับตรวจสอบค่า tagId ที่รับมาจาก params
 * Input : tagId (number)
 * Output : tagId ที่ถูกตรวจสอบแล้ว
 */
export class IdParamDto {
  @IsNumberString()
  tagId?: string;
}

/*
 * คำอธิบาย : DTO สำหรับลบtagตาม tagId
 * Input : params (IdParamDto)
 * Output : ข้อมูลtagที่ถูกลบ
 */
export const deleteTagByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบข้อมูลTagตาม tagId
 * Input : req.params.tagId
 * Output : JSON response พร้อมข้อมูลTagที่ถูกลบ
 */
export const deleteTagById: TypedHandlerFromDto<
  typeof deleteTagByIdDto
> = async (req, res) => {
  try {
    const result = await TagService.deleteTagById(Number(req.params.tagId));
    return createResponse(res, 200, "Tag deleted successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : DTO สำหรับแก้ไขข้อมูลTag
 * Input : body (updateTagDto), params (IdParamDto)
 * Output : ข้อมูลTagที่ถูกแก้ไข
 */
export const editTagDto = {
  body: TagDto,
  params: IdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแก้ไขข้อมูลTagที่มีอยู่
 * Input : req.params.tagId, req.body (name)
 * Output : JSON response พร้อมข้อมูลTagที่ถูกแก้ไข
 */
export const editTag: TypedHandlerFromDto<typeof editTagDto> = async (
  req,
  res
) => {
  try {
    const tagName = req.body;
    const id = Number(req.params.tagId);
    const result = await TagService.editTag(id, tagName);
    return createResponse(res, 200, "Tag edited successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : DTO สำหรับดึงข้อมูล Tag ทั้งหมด
 * Input : query (PaginationDto)
 * Output : รายการข้อมูล Tag ทั้งหมด (พร้อมข้อมูลการแบ่งหน้า)
 */
export const getAllTagsDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getAllTags
 * Input : req.body - ข้อมูลผู้ใช้จาก client
 * Output :
 *   - 200 OK พร้อมข้อมูล Tag ทั้งหมด
 *   - 400 Bad Request ถ้ามี error
 */
export const getAllTags: TypedHandlerFromDto<typeof getAllTagsDto> = async (
  req,
  res
) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await TagService.getAllTags(Number(page), Number(limit));

    return createResponse(res, 200, "Tags retrieved successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
