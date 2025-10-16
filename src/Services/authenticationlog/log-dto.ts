/*
 * คำอธิบาย : DTO สำหรับ authentication log query parameters
 * ใช้สำหรับ filtering และค้นหา authentication logs
 */

import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../pagination-dto.js";

/*
 * Class : LogQueryDto
 * คำอธิบาย : กำหนด schema สำหรับ log query parameters
 * Input : query parameters
 *   - page : หมายเลขหน้า (จาก PaginationDto)
 *   - limit : จำนวนรายการต่อหน้า (จาก PaginationDto)
 *   - searchName (optional) : ค้นหาจากชื่อผู้ใช้
 *   - filterRole (optional) : กรองตาม role ("all" = ทั้งหมด, อื่นๆ = กรองตาม role ที่ระบุ)
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export class LogQueryDto extends PaginationDto {
  @Expose()
  @IsOptional()
  @IsString({ message: "ชื่อที่ค้นหาต้องเป็นข้อความ" })
  searchName?: string;

  @Expose()
  @IsOptional()
  @IsString({ message: "บทบาทที่กรองต้องเป็นข้อความ" })
  filterRole?: string;
}

