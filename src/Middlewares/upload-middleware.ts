// Middlewares/upload-middleware.ts
import type { Request, Response, NextFunction } from "express";
import path from "path";
import { compressImage, compressVideo } from "~/Libs/compressFile.js";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png"]);
const VIDEO_EXT = new Set([".mp4"]); // จะเพิ่ม .mov/.m4v/.webm ก็ใส่ตรงนี้

async function compressOne(f: Express.Multer.File) {
    const ext = path.extname(f.originalname).toLowerCase();
    if (IMAGE_EXT.has(ext)) await compressImage(f.path);
    else if (VIDEO_EXT.has(ext)) await compressVideo(f.path);
}

export async function compressUploaded(req: Request, _res: Response, next: NextFunction) {
    try {
        if (req.file) {
            await compressOne(req.file);
        } else if (Array.isArray(req.files)) {
            for (const f of req.files) await compressOne(f as Express.Multer.File);
        } else if (req.files && typeof req.files === "object") {
            const all = Object.values(req.files).flat() as Express.Multer.File[];
            for (const f of all) await compressOne(f);
        }
        next();
    } catch (err) { next(err); }
}

// ถ้าอยากให้ชื่อเดิมทำงานหลายไฟล์ได้ด้วย:
export const compressUploadedFile = compressUploaded;
