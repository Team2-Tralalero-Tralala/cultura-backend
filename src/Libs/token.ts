/*
 * คำอธิบาย : ไฟล์นี้ใช้สำหรับการจัดการ JSON Web Token (JWT)
 * ประกอบด้วยการสร้าง token และการตรวจสอบ token โดยอ้างอิงจาก secret key
 * ใช้ร่วมกับข้อมูลผู้ใช้ (LoginData) ที่มี id, username, และ role
 */

import jwt from "jsonwebtoken";
import { IsNumber, IsString } from "class-validator";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/*
 * คำอธิบาย : คลาสสำหรับเก็บโครงสร้างข้อมูลผู้ใช้ (payload) ที่ใช้สร้าง JWT
 * Input : -
 * Output : LoginData object ที่มี property ดังนี้:
 *   - id (number) : รหัสผู้ใช้
 *   - username (string) : ชื่อผู้ใช้
 *   - role (string) : บทบาท (role) ของผู้ใช้ เช่น admin, tourist
 */

export class LoginData {
  @IsNumber()
  id: number;

  @IsString()
  username: string;

  @IsString()
  role: string;
}
/*
 * ฟังก์ชัน : generateToken
 * คำอธิบาย : ฟังก์ชันสำหรับสร้าง JSON Web Token (JWT)
 * โดยใช้ข้อมูล payload เซ็นด้วย secret key และกำหนดอายุการใช้งานเป็น 1 ชั่วโมง
 * Input : payload (LoginData) - ข้อมูลผู้ใช้ เช่น id, username, role
 * Output : token (string) - JWT ที่สามารถนำไปใช้ยืนยันตัวตน
 */
export function generateToken(payload: LoginData) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}
/*
 * ฟังก์ชัน : verifyToken
 * คำอธิบาย : ฟังก์ชันสำหรับตรวจสอบและถอดรหัส JWT ที่ได้รับมา
 * Input : token (string) - JWT ที่ต้องการตรวจสอบ
 * Output : LoginData - ข้อมูล payload ของผู้ใช้ที่ถูกถอดรหัสจาก token
 * Error : จะ throw error ถ้า token ไม่ถูกต้องหรือหมดอายุ
 */
export function verifyToken(token: string): LoginData {
  return jwt.verify(token, JWT_SECRET) as unknown as LoginData;
}
