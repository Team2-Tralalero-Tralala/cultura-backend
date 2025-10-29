import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import * as BankService from "~/Services/bank/bank-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

export const getAllBanksDto = {} satisfies commonDto;

/**
 * ดึงรายชื่อธนาคารทั้งหมด
 * input: ไม่มี
 * output: รายชื่อธนาคารในรูปแบบอาเรย์ของอ็อบเจ็กต์
 */
export const getAllBanks: TypedHandlerFromDto<typeof getAllBanksDto> = async (
  req,
  res
) => {
  try {
    const result = await BankService.getAllBanks();
    return createResponse(res, 200, "fetch admin successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
