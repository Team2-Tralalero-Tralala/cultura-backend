/*
 * คำอธิบาย : Controller สำหรับจัดการ Request/Response ของ User
 * ทำหน้าที่รับค่าจาก client, ตรวจสอบความถูกต้อง,
 * เรียกใช้ UserService เพื่อเชื่อมกับฐานข้อมูล และส่ง response กลับไปยัง client
 * ฟังก์ชันหลัก:
 *   - getById : ดึงข้อมูลผู้ใช้จาก id
 *   - getByStatus : ดึงข้อมูลผู้ใช้ทั้งหมดตามสถานะ (ACTIVE, BLOCKED)
 *   - deleteAccount : ลบผู้ใช้ตาม id
 */

import type { Request, Response } from "express";
import * as UserService from "../Services/user-service.js";
import { UserStatus } from "@prisma/client";

import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/*
 * ฟังก์ชัน : getById
 * คำอธิบาย : ดึงข้อมูลผู้ใช้จาก id ที่ client ส่งมา
 * Input : req.params.id (string) → แปลงเป็น number
 * Output : user object (JSON)
 * Error :
 *   - 400 : ถ้า id ไม่ใช่ตัวเลข
 *   - 404 : ถ้าไม่พบผู้ใช้
 */
export const getUserById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id ?? "0", 10);
    if (isNaN(id)) {        
        return createErrorResponse(res, 400, "Invalid user id");
    }
    try {
        const user = await UserService.getUserById(id);
        return createResponse(res, 200, "User fetched successfully", user);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

/*
 * ฟังก์ชัน : getByStatus
 * คำอธิบาย : ดึงข้อมูลผู้ใช้ทั้งหมดที่มีสถานะตรงกับค่าที่กำหนดใน UserStatus enum
 * Input :
 *   - req.params.status (string) : สถานะผู้ใช้ เช่น "ACTIVE" หรือ "BLOCKED" → แปลงเป็น uppercase
 * Output :
 *   - users (array of user object) : รายชื่อผู้ใช้ที่มีสถานะตรงตามที่ระบุ
 * Error :
 *   - 400 : ถ้า status ไม่ถูกต้องหรือไม่ตรงกับค่าใน UserStatus enum
 *   - 500 : ถ้าเกิดข้อผิดพลาดภายในระบบ/ฐานข้อมูล
 */
export const getUserByStatus = async (req: Request, res: Response) => {
    const status = req.params.status?.toUpperCase();
    if (!status || !Object.values(UserStatus).includes(status as UserStatus)) {
        return createErrorResponse(res, 400, "Invalid status. Must be ACTIVE or BLOCKED");
    }
    try {
        const users = await UserService.getUserByStatus(status as UserStatus);
        return createResponse(res, 200, "User fetched successfully", users);
    } catch (error) {
        return createErrorResponse(res, 500, (error as Error).message);
    }
};

/*
 * ฟังก์ชัน : deleteAccount
 * คำอธิบาย : ลบผู้ใช้จากฐานข้อมูลตาม id ที่ส่งมา
 * Input : req.params.id (string) → แปลงเป็น number
 * Output : 
 *   - message (string) : "User deleted successfully"
 *   - user (object) : ข้อมูลผู้ใช้ที่ถูกลบ
 * Error :
 *   - 400 : ถ้า id ไม่ใช่ตัวเลข
 *   - 404 : ถ้าไม่พบผู้ใช้
 */
export const deleteAccount = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id ?? "0", 10);
    if (isNaN(id)) {
        return createErrorResponse(res, 400, "Invalid user id");
    }
    try {
        const deletedUser = await UserService.deleteAccount(id);
        return createResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};


export const blockAccount = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id ?? "0", 10);
    if (isNaN(id)) {
        return createErrorResponse(res, 400, "Invalid user id");
    }
    try {
        const blockedUser = await UserService.blockAccount(id);
        return createResponse(res, 200, "User blocked successfully", blockedUser);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};