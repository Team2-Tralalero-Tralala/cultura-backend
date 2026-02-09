import * as LogService from "~/Services/authenticationlog/log-service.js";

import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { LogQueryDto } from "~/Services/authenticationlog/log-dto.js";

/*
 * DTO : getLogsDto
 * วัตถุประสงค์ : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint /logs
 * Input : query (LogQueryDto) - pagination parameters
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const getLogsDto = {
  query: LogQueryDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับดึงข้อมูล logs ตาม role พร้อมการค้นหาและกรองข้อมูล
 * Input : 
 *   - req.query - pagination parameters, searchName, filterRole (ผ่านการ validate ด้วย getLogsDto แล้ว)
 *   - req.user - ข้อมูลผู้ใช้จาก auth middleware
 * Output :
 *   - 200 OK พร้อมข้อมูล logs และ pagination metadata
 *   - 401 Unauthorized ถ้าไม่มีการ authenticate
 *   - 400 Bad Request ถ้ามี error
 */
export const getLogs: TypedHandlerFromDto<typeof getLogsDto> = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }

    const { page = 1, limit = 10, searchName, filterRole, filterStartDate, filterEndDate } = req.query;

    const result = await LogService.getUserLogs(
      req.user,
      page,
      limit,
      searchName,
      filterRole,
      filterStartDate,
      filterEndDate
    );
    
    return createResponse(res, 200, "Logs retrieved successfully", result);
  } catch (error) {
    console.error("Error in getLogs:", error);
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
