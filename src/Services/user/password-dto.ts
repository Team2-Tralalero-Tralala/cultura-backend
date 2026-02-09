import { IsString, IsNotEmpty, MaxLength } from "class-validator";
/**
 * DTO: PasswordDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อเปลี่ยนรหัสผ่าน
 * Input: body parameters (newPassword)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class PasswordDto {
  @IsString({ message: "รหัสผ่านต้องเป็นข้อความ" })
  @IsNotEmpty({ message: "รหัสผ่านห้ามว่าง" })
  @MaxLength(80, { message: "รหัสผ่านต้องไม่เกิน 80 ตัวอักษร" })
  newPassword: string;
}
