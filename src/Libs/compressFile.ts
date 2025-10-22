/* 
 * คำอธิบาย: Utility functions สำหรับบีบอัดไฟล์รูปภาพและวิดีโอ
 * ใช้ sharp และ fluent-ffmpeg สำหรับลดขนาดไฟล์
 */
import path from "path";
import fs from "fs";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";

/* 
 * Function: compressImage
 * Input : filePath (string) → path ของไฟล์รูป (.jpg/.jpeg/.png)
 * Output : เขียนทับไฟล์เดิมหลังบีบอัดเรียบร้อย (Promise<void>)
 */

async function compressImage(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    const temp = filePath + ".tmp" + ext;

    if (ext === ".jpg" || ext === ".jpeg") {
        await sharp(filePath).jpeg({ quality: 70 }).toFile(temp);
    } else if (ext === ".png") {
        await sharp(filePath).png({ quality: 70 }).toFile(temp);
    }

    await fs.promises.rename(temp, filePath);
}

/* 
 * Function: compressVideo
 * Input : filePath (string) → path ของไฟล์วิดีโอ
 * Output : เขียนทับไฟล์เดิมหลังบีบอัดเรียบร้อย (Promise<void>)
 */
function compressVideo(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const temp = filePath + ".tmp.mp4";
        ffmpeg(filePath)
            .outputOptions("-vcodec libx264", "-crf 28")
            .save(temp)
            .on("end", async () => {
                await fs.promises.rename(temp, filePath);
                resolve();
            })
            .on("error", reject);
    });
}

export { compressImage, compressVideo }