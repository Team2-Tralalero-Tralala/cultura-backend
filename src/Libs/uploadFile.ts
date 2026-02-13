/*
 * คำอธิบาย: Middleware สำหรับอัปโหลดไฟล์ด้วย Multer
 * กำหนดโฟลเดอร์ปลายทาง สร้างชื่อไฟล์ใหม่
 * และจำกัดชนิดไฟล์ + ขนาดไฟล์ (รองรับทั้งรูปภาพและวิดีโอ)
 */
import multer from "multer";
import path from "path";
import type { Request } from "express";
import type { FileFilterCallback } from "multer";

const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png"]);
const allowedImageMimeTypes = new Set(["image/jpeg", "image/png"]);

const allowedVideoExtensions = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const allowedVideoMimeTypes = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "video/webm",
]);

const maxUploadImageFileSizeInBytes = 5 * 1024 * 1024; 
const maxUploadVideoFileSizeInBytes = 200 * 1024 * 1024; 

/**
 * คำอธิบาย: แปลงชื่อไฟล์จาก encoding latin1 → utf8 เพื่อรองรับอักขระภาษาไทย/พิเศษในชื่อไฟล์
 * Input  : originalName (string) - ชื่อไฟล์เดิมจาก client/upload
 * Output : ชื่อไฟล์ที่ถูกแปลงเป็น utf8 แล้ว (string)
 * หมายเหตุ:
 *   - ใช้กรณีชื่อไฟล์เพี้ยนจากการ encode ของบาง browser/client
 */
function decodeName(originalName: string) {
  return Buffer.from(originalName, "latin1").toString("utf8");
}

/**
 * คำอธิบาย: ทำความสะอาดชื่อไฟล์ให้ปลอดภัยต่อการบันทึกลงระบบไฟล์ และลดโอกาสเกิด error จากชื่อไฟล์ไม่ถูกต้อง
 * Input  : originalName (string) - ชื่อไฟล์เดิมจาก client/upload
 * Output : baseName (string) - ชื่อไฟล์ที่ sanitize แล้ว (ถ้าว่างจะคืนค่า "file")
 * หมายเหตุ:
 *   - ลบ/แทนที่อักขระต้องห้ามใน filesystem
 *   - ตัดอักขระ control และช่องว่างซ้ำ
 *   - ตัดจุดท้ายชื่อไฟล์เพื่อเลี่ยงปัญหาบางระบบไฟล์
 */
function cleanOriginal(originalName: string) {
  const baseName = path
    .basename(decodeName(originalName))
    .normalize("NFC")
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/[\x00-\x1f\x80-\x9f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.+$/, "")
    .trim();

  return baseName || "file";
}

/**
 * คำอธิบาย: สร้าง Multer uploader สำหรับอัปโหลดไฟล์ โดยกำหนด storage (ปลายทาง/ชื่อไฟล์),
 * fileFilter (ตรวจชนิดไฟล์) และ limits (จำกัดขนาดไฟล์) เพื่อใช้งานเป็น middleware ใน route
 * Input  :
 *   - folderPath (string) - โฟลเดอร์ปลายทางสำหรับบันทึกไฟล์ที่อัปโหลด (เช่น "uploads/" หรือ "public/")
 * Output :
 *   - uploader (multer.Multer) - instance ของ Multer สำหรับใช้กับ Express (เช่น upload.single / upload.array / upload.fields)
 * หมายเหตุ:
 *   - รองรับทั้งรูปภาพและวิดีโอ โดยตรวจทั้ง extension และ MIME type
 *   - ตั้ง limits.fileSize เป็นเพดานวิดีโอ และมีการตรวจขนาดแบบแยกชนิดไฟล์เพิ่มเติมภายใน fileFilter
 */
function createUploader(folderPath: string) {
  const storage = multer.diskStorage({
    destination: (_request, _file, callback) => {
      callback(null, folderPath);
    },
    filename: (_request, file, callback) => {
      const uniqueFileName = `${Date.now()}-${cleanOriginal(file.originalname)}`;
      callback(null, uniqueFileName);
    },
  });

  return multer({
    storage,
    fileFilter: (
      _request: Request,
      file: Express.Multer.File,
      callback: FileFilterCallback,
    ) => {
      const fileExtension = path.extname(file.originalname).toLowerCase();

      const isAllowedImageFile =
        allowedImageExtensions.has(fileExtension) &&
        allowedImageMimeTypes.has(file.mimetype);

      const isAllowedVideoFile =
        allowedVideoExtensions.has(fileExtension) &&
        allowedVideoMimeTypes.has(file.mimetype);

      const isAllowedMediaFile = isAllowedImageFile || isAllowedVideoFile;

      if (!isAllowedMediaFile) {
        callback(
          new Error(
            "อนุญาตเฉพาะไฟล์รูปภาพ (.jpg, .jpeg, .png) หรือวิดีโอ (.mp4, .mov, .m4v, .webm) เท่านั้น",
          ),
        );
        return;
      }

      const maxFileSizeInBytes = isAllowedVideoFile
        ? maxUploadVideoFileSizeInBytes
        : maxUploadImageFileSizeInBytes;

      const fileSizeInBytes = (file as unknown as { size?: number }).size;

      if (typeof fileSizeInBytes === "number" && fileSizeInBytes > maxFileSizeInBytes) {
        callback(
          new Error(
            `ไฟล์มีขนาดใหญ่เกินกำหนด (รูปภาพไม่เกิน ${maxUploadImageFileSizeInBytes} bytes, วิดีโอไม่เกิน ${maxUploadVideoFileSizeInBytes} bytes)`,
          ),
        );
        return;
      }

      callback(null, true);
    },
    limits: {
      fileSize: maxUploadVideoFileSizeInBytes,
    },
  });
}

export const upload = createUploader("uploads/");
export const uploadPublic = createUploader("public/");
