import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import {
    commonDto,
    type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import * as HomeService from "../Services/home/home-service.js";

/*
 * DTO : getHomeDto
 * วัตถุประสงค์ : สำหรับดึงข้อมูลหน้าแรก
 * Input : -
 * Output : ข้อมูล carousel images และ activity tags
 */
export const getHomeDto = {} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับดึงข้อมูลหน้าแรก
 * Input : -
 * Output :
 *   - 200 OK พร้อมข้อมูล carousel images และ activity tags
 *   - 400 Bad Request ถ้ามี error
 */
export const getHome: TypedHandlerFromDto<typeof getHomeDto> = async (
  req,
  res
) => {
  try {
    const result = await HomeService.getHomeData();
    return createResponse(res, 200, "ดึงข้อมูลหน้าแรกสำเร็จ", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

