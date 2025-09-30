/* 
 * คำอธิบาย: Middleware สำหรับอัปโหลดไฟล์ด้วย Multer
 * กำหนดโฟลเดอร์ปลายทาง (uploads/) และสร้างชื่อไฟล์ใหม่แบบ unique
 */
import multer from 'multer';

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
            const uniqueName = Date.now() + '-' + file.originalname
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