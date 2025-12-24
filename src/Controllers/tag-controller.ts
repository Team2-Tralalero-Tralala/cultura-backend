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
 * DTO : createTagDto
 * วัตถุประสงค์ : สำหรับสร้างข้อมูลประเภทใหม่
 * Input : body (TagDto)
 * Output : ข้อมูลประเภทที่ถูกสร้าง
 */
export const createTagDto = {
  body: TagDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชัน Handler สำหรับสร้างประเภทใหม่
 * Input : req.body - ข้อมูลประเภทจาก client
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
 * DTO : IdParamDto
 * วัตถุประสงค์ : สำหรับตรวจสอบค่า tagId ที่รับมาจาก params
 * Input : tagId (number)
 * Output : tagId ที่ถูกตรวจสอบแล้ว
 */
export class IdParamDto {
  @IsNumberString()
  tagId?: string;
}

/*
 * DTO : deleteTagByIdDto
 * วัตถุประสงค์ : สำหรับลบประเภทตาม tagId
 * Input : params (IdParamDto)
 * Output : ข้อมูลประเภทที่ถูกลบ
 */
export const deleteTagByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบข้อมูลประเภทตาม tagId
 * Input : req.params.tagId
 * Output : JSON response พร้อมข้อมูลประเภทที่ถูกลบ
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
 * DTO : editTagDto
 * วัตถุประสงค์ : สำหรับแก้ไขข้อมูลประเภทตาม tagId
 * Input : body (updateTagDto), params (IdParamDto)
 * Output : ข้อมูลประเภทที่ถูกแก้ไข
 */
export const editTagDto = {
  body: TagDto,
  params: IdParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแก้ไขข้อมูลประเภทที่มีอยู่
 * Input : req.params.tagId, req.body (name)
 * Output : JSON response พร้อมข้อมูลประเภทที่ถูกแก้ไข
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
 * DTO : getAllTagsDto
 * วัตถุประสงค์ : สำหรับดึงข้อมูลประเภททั้งหมด
 * Input : query (PaginationDto)
 * Output : รายการข้อมูลประเภททั้งหมด พร้อมการแบ่งหน้า
 */
export const getAllTagsDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลประเภททั้งหมด
 * Input : req.body - ข้อมูลผู้ใช้จาก client
 * Output :
 *   - 200 ดึงข้อมูลประเภททั้งหมดสำเร็จ
 *   - 400 ข้อผิดพลาดในการดึงข้อมูลประเภท
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
