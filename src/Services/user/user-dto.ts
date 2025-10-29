/*
 * คำอธิบาย : DTO สำหรับการจัดการบัญชีผู้ใช้ (Account Management)
 * ใช้สำหรับ filtering, ค้นหา, และ pagination
 */

import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "~/Libs/Types/pagination-dto.js";

/*
 * Class : AccountQueryDto
 * คำอธิบาย : Schema สำหรับ query parameters ของการดึงบัญชีผู้ใช้ทั้งหมด
 * Input :
 *   - page : หมายเลขหน้า
 *   - limit : จำนวนรายการต่อหน้า
 *   - searchName (optional) : 
 *   - filterRole (optional) : กรองตามบทบาท (เช่น admin, member)
 */
export class AccountQueryDto extends PaginationDto {
  @Expose()
  @IsOptional()
  @IsString({ message: "คำค้นหาชื่อผู้ใช้ต้องเป็นข้อความ" })
  searchName?: string;

  @Expose()
  @IsOptional()
  @IsString({ message: "ค่าบทบาทที่กรองต้องเป็นข้อความ" })
  filterRole?: string;
}

/*
 * Class : AccountStatusQueryDto
 * คำอธิบาย : Schema สำหรับ query ของหน้า “ผู้ใช้ตามสถานะ”
 * ใช้สำหรับ pagination + search เท่านั้น
 */
export class AccountStatusQueryDto extends PaginationDto {
  @Expose()
  @IsOptional()
  @IsString({ message: "คำค้นหาชื่อผู้ใช้ต้องเป็นข้อความ" })
  searchName?: string;
}

/*
 * Class : IdParamDto
 * คำอธิบาย : ตรวจสอบพารามิเตอร์ userId สำหรับ endpoint ที่ต้องระบุ id
 */
export class IdParamDto {
  @Expose()
  @IsString({ message: "userId ต้องเป็นตัวเลขในรูปแบบ string" })
  userId?: string;
}
