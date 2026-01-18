/*
 * คำอธิบาย : Controller สำหรับการจัดการ Configuration ของระบบ
 * ประกอบด้วยการดูสถานะเซิร์ฟเวอร์ และการเปิด/ปิดเซิร์ฟเวอร์
 * โดยใช้ ConfigService ในการทำงานหลัก และส่งผลลัพธ์กลับด้วย createResponse / createErrorResponse
 */
import type { Request, Response } from "express";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import * as ConfigService from "~/Services/config-service.js";

/*
 * ฟังก์ชัน : getServerStatus
 * คำอธิบาย : Handler สำหรับดูสถานะการทำงานของเซิร์ฟเวอร์
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
 * ฟังก์ชัน : enableServer
 * คำอธิบาย : Handler สำหรับเปิดเซิร์ฟเวอร์
 * Route : POST /super/server/enable
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
 * ฟังก์ชัน : disableServer
 * คำอธิบาย : Handler สำหรับปิดเซิร์ฟเวอร์
 * Route : POST /super/server/disable
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
