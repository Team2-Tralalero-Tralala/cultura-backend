/*
 * คำอธิบาย : Data Transfer Object (DTO) สำหรับตรวจสอบข้อมูล
 * การตอบกลับข้อความรีวิวของสมาชิกในระบบ
 *
 * Field :
 *   - replyMessage : ข้อความตอบกลับรีวิว ความยาวไม่เกิน 100 ตัวอักษร
 */

import { Type } from "class-transformer";
import { IsString, IsNotEmpty, MaxLength, Min, Max, IsArray, IsOptional, IsNumber } from "class-validator";

export class ReplyFeedbackDto {
  @IsString({ message: "ข้อความตอบกลับต้องเป็นข้อความ (string)" })
  @IsNotEmpty({ message: "กรุณากรอกข้อความตอบกลับ" })
  @MaxLength(100, { message: "ข้อความตอบกลับต้องไม่เกิน 100 ตัวอักษร" })
  replyMessage!: string;
}

/*
 * คำอธิบาย : DTO สำหรับนักท่องเที่ยวส่ง Feedback หลังการจองแพ็กเกจ
 * ใช้สำหรับ validate ข้อมูล rating และ message
 */
export class CreateFeedbackDto {
  @Type(() => Number)
  @IsNumber({}, { message: "คะแนนต้องเป็นตัวเลข" })
  @Min(1, { message: "คะแนนต่ำสุดคือ 1" })
  @Max(5, { message: "คะแนนสูงสุดคือ 5" })
  rating!: number;

  @IsString({ message: "ข้อความต้องเป็นตัวอักษร" })
  @IsNotEmpty({ message: "กรุณากรอกความคิดเห็น" })
  @MaxLength(200, { message: "ความคิดเห็นต้องไม่เกิน 200 ตัวอักษร" })
  message!: string;

  @IsArray({ message: "รูปภาพต้องเป็นอาเรย์" })
  @IsOptional()
  @IsString({ each: true, message: "path รูปภาพต้องเป็น string" })
  images?: string[];
}