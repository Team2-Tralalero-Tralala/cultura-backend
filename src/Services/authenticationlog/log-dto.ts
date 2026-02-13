/*
 * คำอธิบาย : DTO สำหรับ authentication log query parameters
 * ใช้สำหรับ filtering และค้นหา authentication logs
 */

import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../pagination-dto.js";

/**
 * DTO: LogQueryDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อค้นหา Log
 * Input: query parameters (searchName = search by username or email, filterRole, filterStartDate, filterEndDate)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
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

  @Expose()
  @IsOptional()
  @IsString({ message: "วันที่เริ่มต้นที่กรองต้องเป็นข้อความในรูปแบบ YYYY-MM-DD" })
  filterStartDate?: string;

  @Expose()
  @IsOptional()
  @IsString({ message: "วันที่สิ้นสุดที่กรองต้องเป็นข้อความในรูปแบบ YYYY-MM-DD" })
  filterEndDate?: string;
}

