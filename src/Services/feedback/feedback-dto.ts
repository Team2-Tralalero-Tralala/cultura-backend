/*
 * คำอธิบาย : Data Transfer Object (DTO) สำหรับตรวจสอบข้อมูล
 * การตอบกลับข้อความรีวิวของสมาชิกในระบบ
 *
 * Field :
 *   - replyMessage : ข้อความตอบกลับรีวิว ความยาวไม่เกิน 100 ตัวอักษร
 */

import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class ReplyFeedbackDto {
  @IsString({ message: "ข้อความตอบกลับต้องเป็นข้อความ (string)" })
  @IsNotEmpty({ message: "กรุณากรอกข้อความตอบกลับ" })
  @MaxLength(100, { message: "ข้อความตอบกลับต้องไม่เกิน 100 ตัวอักษร" })
  replyMessage!: string;
}
