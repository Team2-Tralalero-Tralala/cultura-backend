// Controllers/package-request-controller.ts
import type { Request, Response } from "express";
import { getDetailRequestById } from "~/Services/package/package-request-service.js";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";


/*
 * ฟังก์ชัน : getPendingSuperPackageByIdController
 * คำอธิบาย : Handler สำหรับดึงรายละเอียดแพ็กเกจจาก requestID
 * Input :
 *   - res : Response object ของ Express สำหรับส่งผลลัพธ์กลับไปยัง client
 * Output :
 *   - 200 OK พร้อมข้อมูลแพ็กเกจที่มีสถานะเป็น PENDING_SUPER
 *   - 400 Bad Request ถ้ามีข้อผิดพลาดหรือไม่สามารถดึงข้อมูลได้
 */

export const getDetailRequest = async (req: Request, res: Response) => {
  try {

    const requestIdRaw = req.params.requestId;
    const requestId = Number(requestIdRaw);

    const data = await getDetailRequestById(requestId);
    if (!data) {
      return createErrorResponse(res, 404, "Package not found");
    }
    return createResponse(res, 200, "Get pending super package successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
