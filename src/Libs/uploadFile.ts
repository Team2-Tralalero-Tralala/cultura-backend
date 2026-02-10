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

function decodeName(originalName: string) {
  return Buffer.from(originalName, "latin1").toString("utf8");
}

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
 * คำอธิบาย: ตรวจสอบชนิดไฟล์ อนุญาตเฉพาะไฟล์รูปภาพ
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
 * คำอธิบาย: สร้าง Multer uploader พร้อมกำหนด storage,
 * fileFilter และจำกัดขนาดไฟล์
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

/*
 * Export uploader
 */
export const upload = createUploader("uploads/");
export const uploadPublic = createUploader("public/");
