/*
 * คำอธิบาย : Controller สำหรับจัดการ Request/Response ของ User
 * ทำหน้าที่รับค่าจาก client, ตรวจสอบความถูกต้อง,
 * เรียกใช้ UserService เพื่อเชื่อมกับฐานข้อมูล และส่ง response กลับไปยัง client
 * ฟังก์ชันหลัก:
 *   - getUserById : ดึงข้อมูลผู้ใช้จาก id
 *   - getUserByStatus : ดึงข้อมูลผู้ใช้ทั้งหมดตามสถานะ (ACTIVE, BLOCKED)
 *   - deleteAccount : ลบผู้ใช้ตาม id
 *   - blockAccount : สลับสถานะผู้ใช้ (ACTIVE <-> BLOCKED)
 */

import type { Request, Response } from "express";
import * as UserService from "../Services/user-service.js";
import { UserStatus } from "@prisma/client";

import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/*
 * ฟังก์ชัน : getUserById
 * คำอธิบาย : ดึงข้อมูลผู้ใช้จาก id ที่ client ส่งมา
 * Input :
 *   - req.params.id (string) → แปลงเป็น number
 * Output :
 *   - user (object) : ข้อมูลผู้ใช้ที่พบ
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
 * ฟังก์ชัน : getUserByStatus
 * คำอธิบาย : ดึงข้อมูลผู้ใช้ทั้งหมดที่มีสถานะตรงกับค่าที่กำหนดใน UserStatus enum
 * Input :
 *   - req.params.status (string) → สถานะผู้ใช้ เช่น "ACTIVE", "BLOCKED"
 * Output :
 *   - users (array of object) : รายชื่อผู้ใช้ที่ตรงกับสถานะที่กำหนด
 * Error :
 *   - 400 : ถ้า status ไม่ถูกต้อง (ไม่ตรงกับ UserStatus enum)
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
 * Input :
 *   - req.params.id (string) → แปลงเป็น number
 * Output :
 *   - message (string) : "User deleted successfully"
 *   - result (object) : ผลลัพธ์จากการลบ (เช่น { count: 1 })
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

/*
 * ฟังก์ชัน : blockAccount
 * คำอธิบาย : สลับสถานะผู้ใช้จาก ACTIVE → BLOCKED หรือ BLOCKED → ACTIVE
 * Input :
 *   - req.params.id (string) → แปลงเป็น number
 * Output :
 *   - message (string) : "User blocked successfully"
 *   - updatedUser (object) : ข้อมูลผู้ใช้ที่ถูกอัปเดตพร้อมสถานะใหม่
 * Error :
 *   - 400 : ถ้า id ไม่ใช่ตัวเลข
 *   - 404 : ถ้าไม่พบผู้ใช้
 */
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