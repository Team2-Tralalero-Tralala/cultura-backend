/*
 * คำอธิบาย : Data Transfer Object (DTO) สำหรับตรวจสอบข้อมูล
 * การตอบกลับข้อความรีวิวของสมาชิกในระบบ
 *
 * Field :
 *   - replyMessage : ข้อความตอบกลับรีวิว ความยาวไม่เกิน 100 ตัวอักษร
 */

import { IsString, IsNotEmpty, MaxLength, IsNumber, Min, Max, IsArray, IsOptional } from "class-validator";

export class ReplyFeedbackDto {
  @IsString({ message: "ข้อความตอบกลับต้องเป็นข้อความ (string)" })
  @IsNotEmpty({ message: "กรุณากรอกข้อความตอบกลับ" })
  @MaxLength(100, { message: "ข้อความตอบกลับต้องไม่เกิน 100 ตัวอักษร" })
  replyMessage!: string;
}

export class CreateFeedbackDto {
  @IsNumber({}, { message: "คะแนนต้องเป็นตัวเลข" })
  @Min(1, { message: "คะแนนต่ำสุดคือ 1" })
  @Max(5, { message: "คะแนนสูงสุดคือ 5" })
  rating!: number;

  @IsString({ message: "ข้อความต้องเป็นตัวอักษร" })
  @IsNotEmpty({ message: "กรุณากรอกความคิดเห็น" })
  @MaxLength(200, { message: "ความคิดเห็นต้องไม่เกิน 200 ตัวอักษร" }) // อ้างอิงขนาดจาก [cite: 62]
  message!: string;

  @IsArray({ message: "รูปภาพต้องเป็นอาเรย์" })
  @IsOptional()
  @IsString({ each: true, message: "path รูปภาพต้องเป็น string" })
  images?: string[];
}