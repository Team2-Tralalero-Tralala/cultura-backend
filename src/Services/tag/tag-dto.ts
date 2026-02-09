import {
  IsString,
  IsNotEmpty,
  MaxLength,
} from "class-validator";
/**
 * DTO: TagDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อสร้าง Tag
 * Input: body parameters (name)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class TagDto {
  @IsString()
  @IsNotEmpty({ message: "tag name ห้ามว่าง" })
  @MaxLength(90, { message: "tag name ยาวเกิน 90 ตัวอักษร" })
  name: string; 
}
