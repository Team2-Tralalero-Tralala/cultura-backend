import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  ValidateNested,
  Matches,
} from "class-validator";
import { LocationDto } from "../location/location-dto.js";
import { Type } from "class-transformer";

export class HomestayDto {
  @IsString()
  @IsNotEmpty({ message: "ชื่อโฮมสเตย์ห้ามว่าง" })
  @MaxLength(60, { message: "ชื่อโฮมสเตย์ต้องไม่เกิน 60 ตัวอักษร" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "ประเภทห้องพักห้ามว่าง" })
  @MaxLength(45, { message: "ประเภทห้องพักต้องไม่เกิน 45 ตัวอักษร" })
  roomType: string;

  @IsNumber({}, { message: "จำนวนคนต้องเป็นตัวเลข" })
  @IsInt({ message: "จำนวนคนต้องเป็นจำนวนเต็ม" })
  @IsPositive({ message: "จำนวนคนต้องมากกว่า 0" })
  @Min(1, { message: "จำนวนคนต้องอย่างน้อย 1" })
  capacity: number;
}

export class HomestayWithLocationDto extends HomestayDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}
