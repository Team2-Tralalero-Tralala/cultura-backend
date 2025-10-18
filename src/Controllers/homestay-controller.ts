import { IsNumberString } from "class-validator";
import prisma from "~/Services/database-service.js"; // ✅ เพิ่มบรรทัดนี้
import * as HomestayService from "~/Services/homestay/homstay-service.js"
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { PaginationDto } from "~/Services/pagination-dto.js";

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
 * คำอธิบาย : DTO สำหรับดึง homestay ทั้งหมดในชุมชน (เฉพาะ superadmin)
 * Input : params (communityId), query (page, limit)
 * Output : รายการ homestay ทั้งหมดในชุมชนนั้น
 */
export const getHomestaysAllDto = {
  params: IdParamDto,
  query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getHomestaysAll
 * อธิบาย : ดึง homestay ทั้งหมดในชุมชน (เฉพาะ superadmin)
 * Input :
 *   - req.user.id (จาก middleware auth)
 *   - req.params.communityId
 *   - req.query.page, req.query.limit
 * Output : JSON response พร้อม homestay ทั้งหมดในชุมชนนั้น
 */
export const getHomestaysAll: TypedHandlerFromDto<
  typeof getHomestaysAllDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const communityId = Number(req.params.communityId);
    const { page = 1, limit = 10 } = req.query;

    const result = await HomestayService.getHomestaysAll(
      userId,
      communityId,
      Number(page),
      Number(limit)
    );

    // ✅ ดึงชื่อชุมชนจากฐานข้อมูล
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { name: true },
    });

    const communityName = community
      ? `${community.name} (ID: ${communityId})`
      : `ID: ${communityId}`;

    return createResponse(
      res,
      200,
      `Homestays list in community ${communityName} retrieved successfully`,
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
