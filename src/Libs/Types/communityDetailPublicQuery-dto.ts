import { IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO : CommunityDetailPublicQueryDto
 * คำอธิบาย : Query parameters สำหรับหน้า Public Community Detail (แยก pagination ของแต่ละ section)
 *
 * Input (Query):
 *  - packagePage?, packageLimit?
 *  - storePage?, storeLimit?
 *  - homestayPage?, homestayLimit?
 *
 * Output:
 *  - แปลงค่า query เป็น number และ validate ว่าเป็นจำนวนเต็ม และต้อง >= 1
 */

export class CommunityDetailPublicQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "packagePage must be an integer" })
  @Min(1, { message: "packagePage must be >= 1" })
  packagePage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "packageLimit must be an integer" })
  @Min(1, { message: "packageLimit must be >= 1" })
  packageLimit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "storePage must be an integer" })
  @Min(1, { message: "storePage must be >= 1" })
  storePage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "storeLimit must be an integer" })
  @Min(1, { message: "storeLimit must be >= 1" })
  storeLimit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "homestayPage must be an integer" })
  @Min(1, { message: "homestayPage must be >= 1" })
  homestayPage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "homestayLimit must be an integer" })
  @Min(1, { message: "homestayLimit must be >= 1" })
  homestayLimit?: number;
}
