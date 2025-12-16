import { IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

/**
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
  @IsInt({ message: "packagePage ต้องเป็นจำนวนเต็ม" })
  @Min(1, { message: "packagePage ต้องมีค่าอย่างน้อย 1" })
  packagePage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "packageLimit ต้องเป็นจำนวนเต็ม" })
  @Min(1, { message: "packageLimit ต้องมีค่าอย่างน้อย 1" })
  packageLimit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "storePage ต้องเป็นจำนวนเต็ม" })
  @Min(1, { message: "storePage ต้องมีค่าอย่างน้อย 1" })
  storePage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "storeLimit ต้องเป็นจำนวนเต็ม" })
  @Min(1, { message: "storeLimit ต้องมีค่าอย่างน้อย 1" })
  storeLimit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "homestayPage ต้องเป็นจำนวนเต็ม" })
  @Min(1, { message: "homestayPage ต้องมีค่าอย่างน้อย 1" })
  homestayPage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "homestayLimit ต้องเป็นจำนวนเต็ม" })
  @Min(1, { message: "homestayLimit ต้องมีค่าอย่างน้อย 1" })
  homestayLimit?: number;
}
