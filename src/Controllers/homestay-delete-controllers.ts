import type { Request, Response } from "express";
import * as homestayService from "../Services/homestay-delete-service.js";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";

/*
 * ฟังก์ชัน : deleteHomestay
 * คำอธิบาย : สำหรับลบโฮมสเตย์ออกจากรายการ (Soft Delete)
 * Input :
 *   - req.params.id : รหัสโฮมสเตย์ (HomestayID)
 * Output :
 *   - 200 OK : เมื่อ Soft Delete สำเร็จ
 *   - 400 Bad Request : กรณีไม่พบข้อมูลหรือเกิดข้อผิดพลาด
 */

export const homestayDataByID = async (req: Request, res: Response) => {
  try {
    const homestayId = Number(req.params.id);
    if (isNaN(homestayId)) {
      return createErrorResponse(res, 400, "Invalid homestay ID");
    }

    const homestayDataByID = await homestayService.homestayDataByID(homestayId);
    if (!homestayDataByID) {
      return createErrorResponse(res, 400, "Homestay not found");
    }
    // ถ้าลบสำเร็จ ให้ส่งข้อมูลกลับพร้อมข้อความยืนยัน
    return createResponse(
      res,
      200,
      "Deleted homestay successfully",
      homestayDataByID
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

