import {
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { LocationDto } from "../location/location-dto.js";

export class StoreDto {
  @IsString({ message: "ชื่อร้านต้องเป็นข้อความ" })
  @IsNotEmpty({ message: "ชื่อร้านห้ามว่าง" })
  @MaxLength(80, { message: "ชื่อร้านต้องไม่เกิน 80 ตัวอักษร" })
  name: string;

  @IsString({ message: "รายละเอียดต้องเป็นข้อความ" })
  @IsNotEmpty({ message: "รายละเอียดห้ามว่าง" })
  @MaxLength(200, { message: "รายละเอียดต้องไม่เกิน 200 ตัวอักษร" })
  detail: string;
}

export class StoreWithLocationDto extends StoreDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}
