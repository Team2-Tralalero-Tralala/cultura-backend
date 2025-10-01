import type { Request, Response } from "express";
import * as CommunityService from "../Services/community/community-service.js";
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
 * ฟังก์ชัน : getCommunityByMe
 * Input : req.user.id - ข้อมูล userId ที่ middleware auth ใส่มาให้
 * Output :
 *   - 200 OK พร้อมข้อมูล community ที่ผู้ใช้มีสิทธิ์เข้าถึง (admin/member)
 *   - 400 Bad Request ถ้ามี error ที่สามารถคาดเดาได้
 */
export const getCommunityByMe = async (req: Request, res: Response) => { 
  try {
    const userId = Number(req.user.id);
      const { page = 1, limit = 10 } = req.query;

    const result = await CommunityService.getCommunityByMe(userId, Number(page), Number(limit));
    return createResponse(res, 200, "Community list by role", result);

  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};


/*
 * ฟังก์ชัน : getCommunityAll
 * Input : req.user.id - ข้อมูล userId ที่ middleware auth ใส่มาให้
 * Output :
 *   - 200 OK พร้อมข้อมูล community ทั้งหมด (สำหรับ superadmin)
 *   - 400 Bad Request ถ้ามี error ที่ตรวจสอบได้
 */
export const getCommunityAll = async (req: Request, res: Response) => { 
  try {
    const userId = Number(req.user.id);
    const { page = 1, limit = 10 } = req.query;
    const result = await CommunityService.getCommunityAll(userId, Number(page), Number(limit));
    return createResponse(res, 200, "All communities list", result);
    
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
