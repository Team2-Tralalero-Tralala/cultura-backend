import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsArray,
  ArrayUnique,
} from "class-validator";
import { LocationDto } from "../location/location-dto.js";
import { ImageType } from "@prisma/client";

import { Type } from "class-transformer";

export class HomestayDto {
  @IsString()
  @IsNotEmpty({ message: "ชื่อโฮมสเตย์ห้ามว่าง" })
  @MaxLength(60, { message: "ชื่อโฮมสเตย์ต้องไม่เกิน 60 ตัวอักษร" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "ประเภทห้องพักห้ามว่าง" })
  @MaxLength(45, { message: "ประเภทห้องพักต้องไม่เกิน 45 ตัวอักษร" })
  type: string;

  @IsNumber({}, { message: "จำนวนคนต้องเป็นตัวเลข" })
  @IsInt({ message: "จำนวนคนต้องเป็นจำนวนเต็ม" })
  @IsPositive({ message: "จำนวนคนต้องมากกว่า 0" })
  @Min(1, { message: "จำนวนคนต้องอย่างน้อย 1" })
  guestPerRoom: number;

  @IsNumber({}, { message: "จำนวนคนต้องเป็นตัวเลข" })
  @IsInt({ message: "จำนวนคนต้องเป็นจำนวนเต็ม" })
  @IsPositive({ message: "จำนวนคนต้องมากกว่า 0" })
  @Min(1, { message: "จำนวนคนต้องอย่างน้อย 1" })
  totalRoom: number;

  @IsString({ message: "รายละเอียดต้องเป็นข้อความ" })
  @IsNotEmpty({ message: "รายละเอียดห้ามว่าง" })
  @MaxLength(200, { message: "รายละเอียดต้องไม่เกิน 200 ตัวอักษร" })
  facility: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ValidateNested()
  @Type(() => HomestayImageDto)
  @IsOptional()
  homestayImage?: HomestayImageDto[];

  @IsOptional()
  @IsArray({ message: "tagHomestays ต้องเป็นอาเรย์ของตัวเลข" })
  @ArrayUnique({ message: "tagHomestays ต้องไม่ซ้ำกัน" })
  @IsInt({ each: true, message: "tagHomestays ทุกค่าต้องเป็นตัวเลขจำนวนเต็ม" })
  @Type(() => Number) // แปลง string -> number อัตโนมัติเมื่อมาจาก JSON/form
  tagHomestays?: number[];
}

export class HomestayImageDto {
  @IsString()
  @MaxLength(256, { message: "image ต้องไม่เกิน 256 ตัวอักษร" })
  image: string;

  @IsEnum(ImageType)
  type: ImageType;
}
