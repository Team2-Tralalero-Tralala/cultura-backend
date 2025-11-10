/*
 * คำอธิบาย : DTO สำหรับการจัดการบัญชีผู้ใช้ (Account Management)
 * ใช้สำหรับ filtering, ค้นหา, และ pagination
 */

import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "~/Libs/Types/pagination-dto.js";


/*
 * Class : IdParamDto
 * คำอธิบาย : ตรวจสอบพารามิเตอร์ userId สำหรับ endpoint ที่ต้องระบุ id
 */
export class IdParamDto {
  @Expose()
  @IsString({ message: "userId ต้องเป็นตัวเลขในรูปแบบ string" })
  userId?: string;
}
