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
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname
        cb(null, uniqueName)
    }
})

/* 
 * Export: upload
 * Multer middleware ที่ใช้ config จาก storage
 */
export const upload = multer({ storage })