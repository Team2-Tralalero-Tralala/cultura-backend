import { IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { PaginationDto } from "~/Libs/Types/pagination-dto.js";

/*
 * DTO: GetSuperAdminDashboardDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อเรียกใช้งาน Dashboard ของ Super Admin
 * Input: query parameters (dateStart, dateEnd, page, limit, groupBy, province, region, search)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class GetSuperAdminDashboardDto extends PaginationDto {
  @IsString({ message: "dateStart ต้องเป็น string" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dateStart ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  dateStart: string;

  @IsString({ message: "dateEnd ต้องเป็น string" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dateEnd ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  dateEnd: string;

  @IsOptional()
  @IsEnum(["hour", "day", "week", "month", "year"], {
    message: "groupBy ต้องเป็น hour, day, week, month หรือ year",
  })
  groupBy?: "hour" | "day" | "week" | "month" | "year" = "day";

  @IsOptional()
  @IsString({ message: "province ต้องเป็น string" })
  province?: string;

  @IsOptional()
  @IsString({ message: "region ต้องเป็น string" })
  region?: string;

  @IsOptional()
  @IsString({ message: "search ต้องเป็น string" })
  search?: string;
}
export class GetAdminDashboardDto extends PaginationDto {
  @IsString({ message: "dateStart ต้องเป็น string" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dateStart ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  dateStart: string;

  @IsString({ message: "dateEnd ต้องเป็น string" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dateEnd ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  dateEnd: string;

  @IsOptional()
  @IsEnum(["hour", "day", "week", "month", "year"], {
    message: "groupBy ต้องเป็น hour, day, week, month หรือ year",
  })
  groupBy?: "hour" | "day" | "week" | "month" | "year" = "day";
}
