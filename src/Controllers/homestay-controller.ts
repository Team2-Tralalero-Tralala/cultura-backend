import { IsNumberString } from "class-validator";
import * as HomestayService from "~/Services/homestay/homestay-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

/*
 * DTO สำหรับตรวจสอบ homestayId ที่รับมาจาก params
 */
export class IdParamDto {
  @IsNumberString()
  homestayId?: string;
}

/*
 * DTO สำหรับ getHomestayById
 */
export const getHomestayByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน: getHomestayById
 * อธิบาย: ดึงข้อมูลที่พักตาม homestayId (ไม่ตรวจสิทธิ์ผู้ใช้)
 */
export const getHomestayById: TypedHandlerFromDto<
  typeof getHomestayByIdDto
> = async (req, res) => {
  try {
    const homestayId = Number(req.params.homestayId);
    const result = await HomestayService.getHomestayById(homestayId);
    return createResponse(
      res,
      200,
      "Homestay detail retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
