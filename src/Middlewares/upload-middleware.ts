/* 
 * คำอธิบาย: Middleware สำหรับบีบอัดไฟล์ที่อัปโหลดเข้ามา
 * รองรับรูปภาพ (.jpg, .jpeg, .png) และวิดีโอ (.mp4)
 * เรียกใช้ compressImage และ compressVideo เพื่อลดขนาดไฟล์
 */
import type { Request, Response, NextFunction } from "express";
import path from 'path';
import fs from 'fs';
import { compressImage, compressVideo } from "~/Libs/compressFile.js";

/* 
 * Function: compressUploadedFile
 * Input : req (Request) → ไฟล์อัปโหลด (req.file)
 *         res (Response)
 *         next (NextFunction)
 * Output: ดำเนินการบีบอัดไฟล์ (ถ้ามี) และส่งต่อไปยัง middleware ถัดไป
 */
export async function compressUploadedFile( req: Request, res: Response, next: NextFunction) {
    if (!req.file) return next();

    const ext = path.extname(req.file.originalname).toLowerCase();
    const inputPath = req.file.path;

    try {
        if ([".jpg", ".jpeg", ".png"].includes(ext)) {
            await compressImage(inputPath);
        } else if (ext === ".mp4") {
            await compressVideo(inputPath);
        }
        next();
    } catch (err) {
        next(err);
    }
};