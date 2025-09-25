/*
 * คำอธิบาย : Controller สำหรับการจัดการ Logs
 * ประกอบด้วยการดึงข้อมูล logs ตาม role และ pagination
 * - superadmin เห็น logs ทั้งหมด
 * - admin เห็น logs ของสมาชิกในชุมชนของตนเองเท่านั้น
 * - member/tourist เห็น logs ของตนเองเท่านั้น
 */
import { PaginationDto } from "~/Libs/Types/pagination-dto.js";
import * as LogService from "~/Services/log-service.js";

import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/*
 * DTO : getLogsDto
 * คำอธิบาย : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint /logs
 * Input : query (PaginationDto) - pagination parameters
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const getLogsDto = {
  query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getLogs
 * คำอธิบาย : Handler สำหรับดึงข้อมูล logs ตาม role
 * Input : 
 *   - req.query - pagination parameters (ผ่านการ validate ด้วย getLogsDto แล้ว)
 *   - req.user - ข้อมูลผู้ใช้จาก auth middleware
 * Output :
 *   - 200 OK พร้อมข้อมูล logs และ pagination metadata
 *   - 401 Unauthorized ถ้าไม่มีการ authenticate
 *   - 400 Bad Request ถ้ามี error
 * Logic :
 *   - superadmin เห็นทุก log
 *   - admin เห็นเฉพาะ log ของสมาชิกในชุมชนที่ตนเป็น admin
 *   - member/tourist เห็นเฉพาะ log ของตนเอง
 */
export const getLogs: TypedHandlerFromDto<typeof getLogsDto> = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }

    const { page = 1, limit = 10 } = req.query;

    const result = await LogService.getUserLogs(
      req.user,
      page,
      limit
    );
    
    return createResponse(res, 200, "Logs retrieved successfully", result);
  } catch (error) {
    console.error("Error in getLogs:", error);
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
