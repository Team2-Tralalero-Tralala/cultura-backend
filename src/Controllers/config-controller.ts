import type { Request, Response } from "express";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import * as ConfigService from "~/Services/config-service.js";

/*
 * Route : GET /shared/server-status
 * Input : ไม่มี
 * Output :
 *   - 200 OK พร้อมข้อมูลสถานะเซิร์ฟเวอร์
 *   - 500 Internal Server Error ถ้ามี error
 */
export const getServerStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const serverOnline = ConfigService.getServerStatus();
    return createResponse(res, 200, "ดึงข้อมูลสถานะเซิร์ฟเวอร์สำเร็จ", {
      serverOnline,
    });
  } catch (error) {
    return createErrorResponse(res, 500, (error as Error).message);
  }
};

/*
 * คำอธิบาย : Handler สำหรับเปิดเซิร์ฟเวอร์
 * Input : ไม่มี
 * Output :
 *   - 200 OK พร้อมข้อความยืนยันการเปิดเซิร์ฟเวอร์
 *   - 500 Internal Server Error ถ้ามี error
 */
export const enableServer = async (
  req: Request,
  res: Response
) => {
  try {
    ConfigService.setServerStatus(true);
    return createResponse(res, 200, "Server enabled successfully", {
      serverOnline: true,
    });
  } catch (error) {
    return createErrorResponse(res, 500, (error as Error).message);
  }
};

/*
 * คำอธิบาย : Handler สำหรับปิดเซิร์ฟเวอร์
 * Input : ไม่มี
 * Output :
 *   - 200 OK พร้อมข้อความยืนยันการปิดเซิร์ฟเวอร์
 *   - 500 Internal Server Error ถ้ามี error
 */
export const disableServer = async (
  req: Request,
  res: Response
) => {
  try {
    ConfigService.setServerStatus(false);
    return createResponse(res, 200, "Server disabled successfully", {
      serverOnline: false,
    });
  } catch (error) {
    return createErrorResponse(res, 500, (error as Error).message);
  }
};
