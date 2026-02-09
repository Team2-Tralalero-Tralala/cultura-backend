import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import * as BankService from "~/Services/bank/bank-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

export const getAllBanksDto = {} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับดึงรายชื่อธนาคารทั้งหมด
 * Input : ไม่มี
 * Output :
 *   - 200 Created พร้อมรายชื่อธนาคารในรูปแบบอาเรย์ของอ็อบเจ็กต์
 *   - 400 Bad Request ถ้ามี error
 */
export const getAllBanks: TypedHandlerFromDto<typeof getAllBanksDto> = async (
  req,
  res
) => {
  try {
    const result = await BankService.getAllBanks();
    return createResponse(res, 200, "fetch banks successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
