import * as BannerService from "~/Services/banner/banner-service.js";
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
 * คำอธิบาย : รวมไฟล์จากรูปแบบต่าง ๆ ของ Multer เป็นอาร์เรย์เดียว
 * Input  : req (MulterReq)
 * Output : Express.Multer.File[]
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
 * คำอธิบาย: รับไฟล์จากคำขอ → สร้าง payload → เรียก Service.addBanner → ส่งผลลัพธ์กลับ
 * Input  : req(any - มีไฟล์จาก Multer), res
 * Output : 200 OK พร้อมรายการที่สร้าง / 400 Bad Request เมื่อไม่พบไฟล์/เกิดข้อผิดพลาด
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
 * คำอธิบาย: แปลง relative path ในสตอเรจ → public URL (รองรับเสิร์ฟผ่าน express.static)
 * input: path
 * output: public URL
 */
function pathToPublicUrl(path: string) {
    return "/" + encodeURI(path); // served by express.static('public')
}

/**
 * คำอธิบาย: ดึงรายการแบนเนอร์ทั้งหมดจาก Service → ทำให้ path เป็นรูปแบบ public URL (ขึ้นต้นด้วย '/')
 * input: req, res
 * output: 200 OK พร้อมรายการแบนเนอร์ / 400 Bad Request เมื่อเกิดข้อผิดพลาด
 */
export const getBanner = async (req: Request, res: Response) => {
    try {
        const results = await BannerService.getBanner();
        const data = results.map(result => ({
            id: result.id,
            image: "/" + String(result.image || "").replace(/^\/+/, ""), // -> /uploads/xxxx.jpg
        }));
        return createResponse(res, 200, "Get Banner Successful", data);
    } catch (err) {
        return createErrorResponse(res, 400, (err as Error).message);
    }
}

/**
 * คำอธิบาย: อัปเดตรูปของแบนเนอร์ตาม id (ต้องแนบไฟล์ใหม่มาด้วย)
 * input: req, res
 * output: 200 OK (ข้อความ "Add Banner Successful" ตามโค้ดเดิม) / 400 เมื่อ input ไม่ครบหรือเกิดข้อผิดพลาด
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
 * คำอธิบาย: ลบแบนเนอร์ตาม id
 * input: req, res
 * output: 200 OK (ข้อความ "Add Banner Successful" ตามโค้ดเดิม) / 400 เมื่อ input ไม่ครบหรือเกิดข้อผิดพลาด
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
