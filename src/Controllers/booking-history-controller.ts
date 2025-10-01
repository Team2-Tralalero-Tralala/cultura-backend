import type { Request, Response } from "express";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import { getHistoriesByRole } from "../Services/booking-history-service.js";

/*
 * ฟังก์ชัน : getByRole
 * คำอธิบาย : Handler สำหรับดึงประวัติการจองตามสิทธิ์ของผู้ใช้งาน
 * Input :
 *   - req.user : ข้อมูลผู้ใช้ (ได้มาจาก middleware authentication)
 *   - res : Response object ของ Express สำหรับส่งผลลัพธ์กลับไปยัง client
 * Output :
 *   - 200 OK พร้อมข้อมูล booking histories
 *   - 400 Bad Request ถ้ามีข้อผิดพลาดหรือไม่สามารถดึงข้อมูลได้
 */
export const getByRole = async (req: Request, res: Response) => {
  try {
    const {page = 1, limit = 10} = req.query;
    const data = await getHistoriesByRole(req.user, Number(page), Number(limit));
    return createResponse(res, 200, "Get booking histories by role successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

