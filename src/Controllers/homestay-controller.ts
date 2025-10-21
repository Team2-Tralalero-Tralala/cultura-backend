import * as HomestayService from "~/Services/homestay/homestay-service.js";
import { IsNumberString } from "class-validator";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

/*
 * DTO สำหรับ "ดึง Homestay ทั้งหมดในชุมชน"
 */
export class IdParamDto {
  @IsNumberString({}, { message: "communityId ต้องเป็นตัวเลข" })
  communityId?: string; // แก้เป็น optional
}

export const getHomestaysAllDto = { params: IdParamDto } satisfies commonDto;

/*
 * ฟังก์ชัน Controller สำหรับ "ดึง Homestay ทั้งหมดในชุมชน"
 */
export const getHomestaysAll: TypedHandlerFromDto<
  typeof getHomestaysAllDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const communityId = Number(req.params.communityId);
    const result = await HomestayService.getHomestaysAll(userId, communityId);
    return createResponse(res, 200, "get homestay successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
