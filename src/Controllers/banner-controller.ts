/* 
 * File: banner-controller.ts
 * Layer: Controller (Express)
 * มาตรฐาน: CS v1.1.1 — คอมเมนต์ไทยครบถ้วน, ไม่แก้ไขโค้ดเดิม (add comments only)
 * หน้าที่:
 *   - รับไฟล์จาก Multer แล้วแปลงเป็น payload สำหรับ Service
 *   - จัดการ response มาตรฐานผ่าน createResponse/createErrorResponse
 *   - ตรวจสอบพารามิเตอร์พื้นฐาน (id, file)
 * ข้อควรทราบ:
 *   - ฟังก์ชันนี้พึ่งพา middleware อัปโหลด (Multer) และ static serving (express.static)
 *   - มี helper pathToPublicUrl สำหรับแปลง path → public URL แต่ยังไม่ได้ใช้งานในโค้ดนี้
 *   - import บางตัว (commonDto, TypedHandlerFromDto) ยังไม่ถูกใช้งานตรง ๆ ในไฟล์นี้ (คงไว้ตามมาตรฐานโปรเจกต์)
 */

import * as BannerService from "~/Services/banner-service.js";
import type { Request, Response } from "express";
import type {
    commonDto,
    TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/** 
 * ชนิดคำขอที่รองรับโครงสร้างไฟล์จาก Multer:
 * - req.file: อัปโหลดเดี่ยว
 * - req.files: อัปโหลดหลายไฟล์ (แบบ array หรือ object keyed by fieldname)
 */
type MulterReq = Request & {
    file?: Express.Multer.File;
    files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
};

/**
 * ยูทิลิตี้: รวมไฟล์จากรูปแบบต่าง ๆ ของ Multer เป็นอาร์เรย์เดียว
 * Input  : req (MulterReq)
 * Output : Express.Multer.File[]
 * หมายเหตุ:
 *   - รองรับทั้ง single upload และ multiple (array/object)
 *   - ถ้าไม่มีไฟล์จะคืนอาร์เรย์ว่าง []
 */
function gatherFiles(req: MulterReq): Express.Multer.File[] {
    if (req.file) return [req.file];
    if (Array.isArray(req.files)) return req.files as Express.Multer.File[];
    if (req.files && typeof req.files === "object") {
        const map = req.files as Record<string, Express.Multer.File[]>;
        return Object.values(map).flat();
    }
    return [];
}

/**
 * Handler: addBanner
 * คำอธิบาย: รับไฟล์จากคำขอ → สร้าง payload → เรียก Service.addBanner → ส่งผลลัพธ์กลับ
 * Input  : req(any - มีไฟล์จาก Multer), res
 * Output : 200 OK พร้อมรายการที่สร้าง / 400 Bad Request เมื่อไม่พบไฟล์/เกิดข้อผิดพลาด
 * ความปลอดภัย/ข้อควรระวัง:
 *   - ตรวจว่ามีไฟล์อย่างน้อย 1 รายการก่อนทำงาน
 *   - ข้อมูลไฟล์ถูกส่งต่อไปยัง Service โดยเน้นใช้ f.path เป็นค่าที่บันทึก
 */
export const addBanner = async (req: any, res: Response) => {
    try {
        const files = gatherFiles(req);
        if (!files.length) {
            return createErrorResponse(res, 400, "file not found");
        }
        const payload = files.map((f, i) => ({
            order: i + 1,
            key: f.filename,
            originalName: f.originalname,
            mime: f.mimetype,
            size: f.size,
            path: f.path,
        }));
        const results = await BannerService.addBanner(payload);
        return createResponse(res, 200, "Add Banner Successful", results);
    } catch (err) {
        return createErrorResponse(res, 400, (err as Error).message);
    }
}

/**
 * Helper: pathToPublicUrl
 * คำอธิบาย: แปลง relative path ในสตอเรจ → public URL (รองรับเสิร์ฟผ่าน express.static)
 * หมายเหตุ: ฟังก์ชันนี้ยัง *ไม่ถูกใช้งาน* ในไฟล์นี้ (เก็บไว้เผื่อใช้ภายหลัง/อ้างอิง)
 */
function pathToPublicUrl(p: string) {
    return "/" + encodeURI(p); // served by express.static('public')
}

/**
 * Handler: getBanner
 * คำอธิบาย: ดึงรายการแบนเนอร์ทั้งหมดจาก Service → ทำให้ path เป็นรูปแบบ public URL (ขึ้นต้นด้วย '/')
 * Output : 200 OK พร้อมรายการแบนเนอร์ / 400 Bad Request เมื่อเกิดข้อผิดพลาด
 * หมายเหตุ:
 *   - ปรับค่า image ให้แน่ใจว่าขึ้นต้นด้วย "/" (รองรับ client)
 */
export const getBanner = async (req: Request, res: Response) => {
    try {
        const results = await BannerService.getBanner();
        const data = results.map(r => ({
            id: r.id,
            image: "/" + String(r.image || "").replace(/^\/+/, ""), // -> /uploads/xxxx.jpg
        }));
        return createResponse(res, 200, "Get Banner Successful", data);
    } catch (err) {
        return createErrorResponse(res, 400, (err as Error).message);
    }
}

/**
 * Handler: editBanner
 * คำอธิบาย: อัปเดตรูปของแบนเนอร์ตาม id (ต้องแนบไฟล์ใหม่มาด้วย)
 * เงื่อนไขก่อนทำงาน:
 *   - ต้องมีพารามิเตอร์ id (เป็นตัวเลข > 0)
 *   - ต้องมีไฟล์อัปโหลดใน req.file
 * Output : 200 OK (ข้อความ "Add Banner Successful" ตามโค้ดเดิม) / 400 เมื่อ input ไม่ครบหรือเกิดข้อผิดพลาด
 * หมายเหตุ:
 *   - ข้อความสำเร็จยังใช้ "Add Banner Successful" ตามโค้ดเดิม (แม้จะเป็นการแก้ไข) — *ไม่แก้ไขตามคำขอ*
 */
export const editBanner = async (req: any, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!id) return createErrorResponse(res, 400, "invalid id");

        if (!req.file) return createErrorResponse(res, 400, "file not found");

        await BannerService.editBanner(id, req.file);
        return createResponse(res, 200, "Add Banner Successful");
    } catch (err) {
        return createErrorResponse(res, 400, (err as Error).message);
    }
}

/**
 * Handler: deleteBanner
 * คำอธิบาย: ลบแบนเนอร์ตาม id
 * เงื่อนไขก่อนทำงาน:
 *   - ต้องมีพารามิเตอร์ id (เป็นตัวเลข > 0)
 * Output : 200 OK (ข้อความ "Add Banner Successful" ตามโค้ดเดิม) / 400 เมื่อ input ไม่ครบหรือเกิดข้อผิดพลาด
 * หมายเหตุ:
 *   - ข้อความสำเร็จยังใช้ "Add Banner Successful" ตามโค้ดเดิม (แม้จะเป็นการลบ) — *ไม่แก้ไขตามคำขอ*
 */
export const deleteBanner = async (req: any, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!id) return createErrorResponse(res, 400, "invalid id");

        await BannerService.deleteBanner(id);
        return createResponse(res, 200, "Add Banner Successful");
    } catch (err) {
        return createErrorResponse(res, 400, (err as Error).message);
    }
}
