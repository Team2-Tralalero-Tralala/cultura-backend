import type { Request, Response } from "express";
import * as CommunityService from "../Services/community-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/* 
ฟังก์ชัน : getCommunityId (Controller)
คำอธิบาย : ดึงข้อมูลชุมชนจากฐานข้อมูลตาม id ที่ผู้ใช้ส่งมา (req.params.id)
Input : 
  - req (Request) : อ็อบเจกต์ request ที่มี parameter id
  - res (Response) : อ็อบเจกต์ response สำหรับส่งข้อมูลกลับไปยัง client
Output : 
  - response JSON ที่มีข้อมูลชุมชน (community object) เมื่อค้นพบ
Error : 
  - 400 (Invalid community id) หาก id ไม่ใช่ตัวเลข
  - 404 (Community not found) หากไม่พบชุมชนในฐานข้อมูล
*/
export const getCommunityId = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id ?? "0", 10);
    if (isNaN(id)) {
        return createErrorResponse(res, 400, "Invalid community id");
    }
    try {
        const community = await CommunityService.getCommunityById(id);
        return createResponse(res, 200, "Community getById successfully", community);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

