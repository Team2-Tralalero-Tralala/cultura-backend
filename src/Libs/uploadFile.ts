/*
 * คำอธิบาย: Middleware สำหรับอัปโหลดไฟล์ด้วย Multer
 * กำหนดโฟลเดอร์ปลายทาง สร้างชื่อไฟล์ใหม่
 * และจำกัดชนิดไฟล์ + ขนาดไฟล์
 */
import multer from "multer";
import path from "path";
import type { Request } from "express";
import type { FileFilterCallback } from "multer";

const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png"]);
const allowedImageMimeTypes = new Set(["image/jpeg", "image/png"]);

const maxUploadFileSizeInBytes = 5 * 1024 * 1024; // 5 MB

/**
 * คำอธิบาย: แปลงชื่อไฟล์จาก latin1 เป็น utf8 เพื่อรองรับอักขระภาษาไทย/พิเศษ
 * Input  : originalName (string)
 * Output : ชื่อไฟล์ที่ decode แล้ว (string)
 */
function decodeName(originalName: string) {
  return Buffer.from(originalName, "latin1").toString("utf8");
}

/**
 * คำอธิบาย: ทำความสะอาดชื่อไฟล์ให้ปลอดภัยต่อการบันทึกลงระบบไฟล์
 * Input  : originalName (string)
 * Output : baseName ที่ sanitize แล้ว (string)
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
 * คำอธิบาย: ตรวจสอบชนิดไฟล์ก่อนอัปโหลด อนุญาตเฉพาะไฟล์รูปภาพตามนามสกุลและ MIME type ที่กำหนด
 * Input  :
 *   - _request (Request) - คำขอจาก client (ไม่ได้ใช้งานในฟังก์ชันนี้)
 *   - file (Express.Multer.File) - ข้อมูลไฟล์ที่ Multer อ่านได้จากการอัปโหลด
 *   - callback (FileFilterCallback) - callback สำหรับอนุญาต/ปฏิเสธไฟล์
 * Output :
 *   - เรียก callback(null, true) เมื่อไฟล์ผ่านเงื่อนไข
 *   - เรียก callback(Error) เมื่อไฟล์ไม่ผ่านเงื่อนไข (ปฏิเสธการอัปโหลด)
 */
function imageOnlyFileFilter(
  _request: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) {
  const fileExtension = path.extname(file.originalname).toLowerCase();

  const isAllowedImageFile =
    allowedImageExtensions.has(fileExtension) &&
    allowedImageMimeTypes.has(file.mimetype);

  if (!isAllowedImageFile) {
    callback(new Error("อนุญาตเฉพาะไฟล์ .jpg, .jpeg, .png เท่านั้น"));
    return;
  }

  callback(null, true);
}

/**
 * คำอธิบาย: สร้าง instance ของ Multer uploader โดยกำหนด storage (ปลายทาง/ชื่อไฟล์),
 * fileFilter (อนุญาตชนิดไฟล์) และ limits (จำกัดขนาดไฟล์) เพื่อใช้เป็น middleware ใน route
 * Input  :
 *   - folderPath (string) - โฟลเดอร์ปลายทางสำหรับบันทึกไฟล์ที่อัปโหลด (เช่น "uploads/" หรือ "public/")
 * Output :
 *   - Multer uploader (multer.Multer) - middleware สำหรับใช้กับ Express route (เช่น upload.single / upload.array)
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
    fileFilter: imageOnlyFileFilter,
    limits: {
      fileSize: maxUploadFileSizeInBytes,
    },
  });
}

export const upload = createUploader("uploads/");
export const uploadPublic = createUploader("public/");
