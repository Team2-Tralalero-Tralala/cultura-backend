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

/**
 * DTO: SearchQueryDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อค้นหาแพ็กเกจและชุมชน
 * Input: body parameters (search, tag, tags, priceMin, priceMax, sort)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class SearchQueryDto extends PaginationDto {
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
