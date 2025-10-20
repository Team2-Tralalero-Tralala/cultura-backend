/* 
 * คำอธิบาย: Middleware สำหรับอัปโหลดไฟล์ด้วย Multer
 * กำหนดโฟลเดอร์ปลายทาง (uploads/) และสร้างชื่อไฟล์ใหม่แบบ unique
 */
import multer from 'multer';
import path from "path";

function decodeName(name: string) {
    // busboy/multer ให้มาเป็น latin1 ในบางเคส -> แปลงเป็น utf8
    return Buffer.from(name, "latin1").toString("utf8");
}

function cleanOriginal(name: string) {
    const base = path.basename(decodeName(name))
        .normalize("NFC")                         // เก็บอักขระไทยให้ตรง
        .replace(/[/\\?%*:|"<>]/g, "-")          // กันอักขระต้องห้าม
        .replace(/[\x00-\x1f\x80-\x9f]/g, "")    // ลบ control chars
        .replace(/\s+/g, " ")
        .replace(/\.+$/, "")
        .trim();
    return base || "file";
}

/* 
 * Function: storage (multer.diskStorage)
 * - destination: กำหนด path ที่เก็บไฟล์ (uploads/)
 * - filename   : กำหนดชื่อไฟล์ใหม่ โดยใช้ timestamp + ชื่อไฟล์ต้นฉบับ
 */
function createUploader(folder: string) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, folder)
        },
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${cleanOriginal(file.originalname)}`;
            cb(null, uniqueName)
        }
    })

    return multer({ storage });
}

/* 
 * Export: upload
 * Multer middleware ที่ใช้ config จาก storage
 * upload จะอัพโหลดลง Folder "uploads"
 * uploadPublic จะอัพโหลดลง Folder "public"
 */
export const upload = createUploader("uploads/");
export const uploadPublic = createUploader("public/");