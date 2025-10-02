/*
 * คำอธิบาย : DTO สำหรับ pagination parameters
 * ใช้สำหรับ endpoints ที่ต้องการแบ่งหน้าข้อมูล
 */

import { Expose, Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

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
  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 ? num : 1;
  })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && num <= 100 ? num : 10;
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @Expose()
  @IsOptional()
  @IsString()
  search?: string; // ✅ เพิ่มตรงนี้ให้ match docstring
}

export type PaginationResponse<T> = {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
};

