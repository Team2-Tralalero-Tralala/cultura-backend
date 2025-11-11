import { Router } from "express";
import * as BankController from "~/Controllers/bank-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";

const bankRoutes = Router();
/**
 * คำอธิบาย : ใช้สำหรับดึงรายชื่อธนาคารทั้งหมด
 */
/**
 * @swagger
 * /api/super/banks:
 *   get:
 *     summary: ดึงรายการธนาคารทั้งหมด (Get All Banks)
 *     description: ใช้สำหรับดึงข้อมูลรายชื่อธนาคารทั้งหมดในระบบ — เฉพาะผู้ใช้ที่มีสิทธิ์ SuperAdmin หรือ Admin เท่านั้น
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลธนาคารทั้งหมดสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: fetch admin successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: ธนาคารกรุงเทพ
 *             examples:
 *               success:
 *                 summary: ตัวอย่างผลลัพธ์ที่ได้
 *                 value:
 *                   status: 200
 *                   error: false
 *                   message: fetch admin successfully
 *                   data:
 *                     - name: ธนาคารกรุงเทพ
 *                     - name: ธนาคารกสิกรไทย
 *                     - name: ธนาคารกรุงไทย
 *                     - name: ธนาคารทหารไทย
 *                     - name: ธนาคารไทยพาณิชย์
 *                     - name: ธนาคารกรุงศรีอยุธยา
 *                     - name: ธนาคารเกียรตินาคิน
 *                     - name: ธนาคารซีไอเอ็มบีไทย
 *                     - name: ธนาคารทิสโก้
 *                     - name: ธนาคารยูโอบี
 *                     - name: ธนาคารสแตนดาร์ดชาร์เตอร์ด (ไทย)
 *                     - name: ธนาคารไทยเครดิตเพื่อรายย่อย
 *                     - name: ธนาคารแลนด์ แอนด์ เฮาส์
 *                     - name: ธนาคารไอซีบีซี (ไทย)
 *                     - name: ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย
 *                     - name: ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร
 *                     - name: ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย
 *                     - name: ธนาคารออมสิน
 *                     - name: ธนาคารอาคารสงเคราะห์
 *                     - name: ธนาคารอิสลามแห่งประเทศไทย
 *                     - name: ธนาคารซูมิโตโม มิตซุย ทรัสต์ (ไทย)
 *                     - name: ธนาคารฮ่องกงและเซี้ยงไฮ้แบงกิ้งคอร์ปอเรชั่น จำกัด
 *       401:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Missing Token
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (สิทธิ์ไม่เพียงพอ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Forbidden
 */
bankRoutes.get(
  "/super/banks",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(BankController.getAllBanksDto),
  BankController.getAllBanks
);

export default bankRoutes;
