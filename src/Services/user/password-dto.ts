/*
 * คำอธิบาย : Data Transfer Object (DTO) สำหรับตรวจสอบข้อมูลรหัสผ่านใหม่
 * ใช้ในกรณีรีเซ็ตรหัสผ่าน (Reset Password) หรือเปลี่ยนรหัสผ่านของผู้ใช้
 * Field :
 *   - newPassword : รหัสผ่านใหม่ที่ผู้ใช้ต้องการตั้ง
 */
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class PasswordDto {
  @IsString({ message: "รหัสผ่านต้องเป็นข้อความ" })
  @IsNotEmpty({ message: "รหัสผ่านห้ามว่าง" })
  @MaxLength(80, { message: "รหัสผ่านต้องไม่เกิน 80 ตัวอักษร" })
  newPassword: string;
}
