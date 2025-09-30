import {
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsEnum,
  IsOptional,
} from "class-validator";
import { LocationDto } from "../location/location-dto.js";
import { ImageType } from "@prisma/client";
import { Type } from "class-transformer";

export class StoreDto {
  @IsString({ message: "ชื่อร้านต้องเป็นข้อความ" })
  @IsNotEmpty({ message: "ชื่อร้านห้ามว่าง" })
  @MaxLength(80, { message: "ชื่อร้านต้องไม่เกิน 80 ตัวอักษร" })
  name: string;

  @IsString({ message: "รายละเอียดต้องเป็นข้อความ" })
  @IsNotEmpty({ message: "รายละเอียดห้ามว่าง" })
  @MaxLength(200, { message: "รายละเอียดต้องไม่เกิน 200 ตัวอักษร" })
  detail: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ValidateNested()
  @Type(() => StoreImageDto)
  @IsOptional()
  storeImage?: StoreImageDto[];
}

export class StoreImageDto {
  @IsString()
  @MaxLength(256, { message: "image ต้องไม่เกิน 256 ตัวอักษร" })
  image: string;

  @IsEnum(ImageType)
  type: ImageType;
}
