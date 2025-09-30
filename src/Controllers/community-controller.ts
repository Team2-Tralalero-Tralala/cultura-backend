import type { Request, Response } from "express";
import * as CommunityService from "../Services/community-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/*
 * ฟังก์ชัน: getCommunityById (Controller)
 * คำอธิบาย: ใช้สำหรับจัดการ request/response ในการดึงข้อมูลชุมชนตามรหัส (id) 
 * Input:
 *   - req.params.id (number): รหัสชุมชนจากพารามิเตอร์ของ URL
 *   - req (Request): ออบเจกต์ request ของ Express
 *   - res (Response): ออบเจกต์ response ของ Express
 * Output:
 *   - Response JSON: 
 *       - status: 200 และข้อมูลชุมชน หากพบ
 *       - status: 404 และข้อความ error หากไม่พบ
 * Error:
 *   - จัดการ error ผ่าน createErrorResponse หากเกิดข้อผิดพลาด เช่น ไม่พบชุมชน
 */
export const getCommunityById = async (req: Request, res: Response) => {
    try {
        const community = await CommunityService.getCommunityById(Number(req.params.id));
        return createResponse(res, 200, "Community getById successfully", community);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

/*
 * ฟังก์ชัน: getCommunityByUserRole (Controller)
 * คำอธิบาย: ใช้สำหรับดึงรายการชุมชนตามบทบาท (Role) ของผู้ใช้ ผ่าน userId
 * Input:
 *   - req.params.id (number): รหัสผู้ใช้ (User ID) ที่ส่งมาทาง URL
 *   - req (Request): ออบเจกต์ request ของ Express
 *   - res (Response): ออบเจกต์ response ของ Express
 * Output:
 *   - Response JSON:
 *       - status: 200 → คืนค่าข้อมูลในรูปแบบ { I_am, role, data }
 *       - status: 400 → ถ้า userId ไม่ใช่ตัวเลข หรือ role ไม่ถูกต้อง
 *       - status: 404 → ถ้าไม่พบผู้ใช้
 *       - status: 500 → ถ้ามีข้อผิดพลาดอื่น ๆ
 * Error:
 *   - จัดการ error ด้วย createErrorResponse ตามประเภทข้อผิดพลาด
 */

export const getCommunityByUserRole = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  // console.log("userId:", userId);

  if (!Number(userId)) {
    return createErrorResponse(res, 400, "ID must be Number");
  }
  try {
    const { roleName, roleId, communities } = await CommunityService.getCommunityByUserRole(userId);
    return createResponse(res, 200, "Community list by role", {
      I_am: roleName,
      role: roleId,
      data: communities,
    });
  } catch (error: any) {
    if (error.message === "User not found") {
      return createErrorResponse(res, 404, error.message);
    }
    if (error.message === "Invalid user role") {
      return createErrorResponse(res, 400, error.message);
    }
    return createErrorResponse(res, 500, error.message);
  }
};