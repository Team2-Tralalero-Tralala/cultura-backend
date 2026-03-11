/**
 * ฟังก์ชัน Utility สำหรับบีบอัดไฟล์รูปภาพและวิดีโอ
 * ใช้ `sharp` สำหรับรูปภาพและ `fluent-ffmpeg` สำหรับวิดีโอเพื่อลดขนาดไฟล์
 *
 * @module compressFile
 */

import path from "path";
import fs from "fs";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string);
}

/**
 * บีบอัดไฟล์รูปภาพ (.jpg, .jpeg, .png) และเขียนทับไฟล์ต้นฉบับ
 * ใช้การตั้งค่า quality ที่ระดับ 70 สำหรับทั้งรูปแบบ JPEG และ PNG
 *
 * @param {string} filePath - Path สัมบูรณ์หรือสัมพัทธ์ไปยังไฟล์รูปภาพ
 * @returns {Promise<void>} Promise ที่จะทำงานเสร็จสิ้นเมื่อการบีบอัดเสร็จสมบูรณ์
 */
async function compressImage(filePath: string): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();
    const temp = filePath + ".tmp" + ext;

    if (ext === ".jpg" || ext === ".jpeg") {
        await sharp(filePath).jpeg({ quality: 70 }).toFile(temp);
    } else if (ext === ".png") {
        await sharp(filePath).png({ quality: 70 }).toFile(temp);
    }

    await fs.promises.rename(temp, filePath);
}

/**
 * บีบอัดไฟล์วิดีโอและเขียนทับไฟล์ต้นฉบับ
 * ใช้ video codec รูปแบบ `libx264` พร้อมด้วยค่า Constant Rate Factor (CRF) ที่ 28
 * และปรับแต่ง preset เป็น `ultrafast` เพื่อเพิ่มความเร็วในการประมวลผลสูงสุด
 *
 * @param {string} filePath - Path สัมบูรณ์หรือสัมพัทธ์ไปยังไฟล์วิดีโอ
 * @returns {Promise<void>} Promise ที่จะทำงานเสร็จสิ้นเมื่อการบีบอัดเสร็จสมบูรณ์
 */
function compressVideo(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const temp = filePath + ".tmp.mp4";
        ffmpeg(filePath)
            // Use ultrafast preset to make compression much faster
            // Split options correctly to prevent "Unrecognized option 'vcodec libx264'" error
            .outputOptions([
                "-vcodec", "libx264",
                "-crf", "28",
                "-preset", "ultrafast"
            ])
            .save(temp)
            .on("end", async () => {
                await fs.promises.rename(temp, filePath);
                resolve();
            })
            .on("error", reject);
    });
}

export { compressImage, compressVideo }