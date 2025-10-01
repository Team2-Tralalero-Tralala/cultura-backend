import type { Request, Response } from "express";
import { createErrorResponse, createResponse } from "../Libs/createResponse.js";
import { validateDto } from "../Libs/validateDto.js";
import * as CommunityService from "../Services/admin-members-service.js";
import * as AccountService from "../Services/account-service.js";

/**
 * Controller: getMemberByAdmin
 * ----------------------------------------
 * - ใช้สำหรับดึงรายชื่อสมาชิกของชุมชน ที่ admin คนหนึ่งสามารถเข้าถึงได้
 * - Authentication middleware จะต้องใส่ข้อมูล `req.user` ให้เรียบร้อย
 * - ขั้นตอนหลัก:
 *    1) แปลง userId จาก token (req.user.id) ให้เป็น number
 *    2) เรียก service `CommunityService.getMemberByAdmin(userId)`
 *    3) คืน response มาตรฐาน (200 success หรือ 400 error)
 */
export const getMemberByAdmin = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user.id);

    const result = await CommunityService.getMemberByAdmin(userId);

    return createResponse(
      res,
      200,
      "Community members retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
