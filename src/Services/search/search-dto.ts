/*
 * คำอธิบาย : DTO สำหรับการค้นหาแพ็กเกจและชุมชน
 * รองรับการค้นหาแพ็กเกจตาม tag (หลาย tag) และการค้นหาทั้งแพ็กเกจและชุมชนตาม keyword
 * สามารถใช้ search และ tag ร่วมกันได้
 * รองรับการกรองตามราคา (priceMin, priceMax)
 * รองรับการเรียงลำดับผลลัพธ์ (sort: latest, price-low, price-high, popular)
 * 
 * หมายเหตุ: การตรวจสอบว่ามี search หรือ tag อย่างน้อยหนึ่งอย่างจะทำใน controller
 */
import { Expose, Transform } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from "class-validator";

import { PaginationDto } from "../pagination-dto.js";

/*
 * ชนิดข้อมูล : SearchQueryDto
 * คำอธิบาย : Query DTO สำหรับค้นหาแพ็กเกจและชุมชน (สืบทอด page, limit จาก PaginationDto)
 * Input :
 *   - search (string | undefined) - คำค้นหา (optional)
 *   - tag (string[] | undefined) - รายชื่อ tag (optional, รองรับหลายค่า)
 *   - tags (string[] | undefined) - รายชื่อ tag จาก comma-separated (optional)
 *   - priceMin (number | undefined) - ราคาขั้นต่ำ (optional)
 *   - priceMax (number | undefined) - ราคาสูงสุด (optional)
 *   - sort ("latest" | "price-low" | "price-high" | "popular" | undefined) - การเรียงลำดับ (optional)
 * Output : SearchQueryDto
 */
export class SearchQueryDto extends PaginationDto {
  @Expose()
  @IsOptional()
  @IsString({ message: "คำค้นหาต้องเป็นข้อความ" })
  search?: string;

  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    // แปลง tag เป็น array ถ้ายังไม่ใช่ array
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return [value];
  })
  @IsArray({ message: "Tag ต้องเป็น array" })
  @IsString({ each: true, message: "แต่ละ tag ต้องเป็นข้อความ" })
  tag?: string[];

  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    // รองรับ comma-separated tags เช่น "tag1,tag2"
    if (!value) return undefined;
    if (typeof value === "string") {
      return value.split(",").map((t) => t.trim()).filter((t) => t !== "");
    }
    return undefined;
  })
  @IsArray({ message: "Tags ต้องเป็น array" })
  @IsString({ each: true, message: "แต่ละ tag ต้องเป็นข้อความ" })
  tags?: string[];

  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 ? num : undefined;
  })
  @IsNumber({}, { message: "priceMin ต้องเป็นตัวเลข" })
  @Min(0, { message: "priceMin ต้องมากกว่าหรือเท่ากับ 0" })
  priceMin?: number;

  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 ? num : undefined;
  })
  @IsNumber({}, { message: "priceMax ต้องเป็นตัวเลข" })
  @Min(0, { message: "priceMax ต้องมากกว่าหรือเท่ากับ 0" })
  priceMax?: number;

  @Expose()
  @IsOptional()
  @IsString({ message: "sort ต้องเป็นข้อความ" })
  @IsIn(["latest", "price-low", "price-high", "popular"], {
    message: "sort ต้องเป็นหนึ่งใน: latest, price-low, price-high, popular",
  })
  sort?: "latest" | "price-low" | "price-high" | "popular";

  @Expose()
  @IsOptional()
  @IsString({ message: "startDate ต้องเป็นข้อความ" })
  startDate?: string;

  @Expose()
  @IsOptional()
  @IsString({ message: "endDate ต้องเป็นข้อความ" })
  endDate?: string;
}
