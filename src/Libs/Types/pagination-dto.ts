/*
 * คำอธิบาย : DTO สำหรับ pagination parameters
 * ใช้สำหรับ endpoints ที่ต้องการแบ่งหน้าข้อมูล
 */

import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

/*
 * Class : PaginationDto
 * คำอธิบาย : กำหนด schema สำหรับ pagination parameters
 * Input : query parameters
 *   - page (optional) : หมายเลขหน้าที่ต้องการ (เริ่มจาก 1) default = 1
 *   - limit (optional) : จำนวนรายการต่อหน้า default = 10, max = 100
 *   - search (optional) : คำค้นหา
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Page must be a number" })
  @Min(1, { message: "Page must be greater than 0" })
  @Transform(({ value }) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 ? num : 1;
  })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Limit must be a number" })
  @Min(1, { message: "Limit must be at least 1" })
  @Max(100, { message: "Limit cannot exceed 100" })
  @Transform(({ value }) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && num <= 100 ? num : 10;
  })
  limit?: number = 10;
}

/*
 * Type : PaginationResponse
 * คำอธิบาย : Type สำหรับ response ที่มี pagination metadata
 */
export type PaginationResponse<T> = {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
};