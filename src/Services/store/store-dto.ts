import {
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsEnum,
} from "class-validator";
import { LocationDto } from "../location/location-dto.js";
import { ImageType } from "@prisma/client";
import { Type } from "class-transformer";
/**
 * DTO: StoreDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อสร้าง Store
 * Input: body parameters (name, detail, location, tagStores, storeImage)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
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
  @IsNotEmpty({ message: "ต้องใส่ที่อยู่" })
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNotEmpty({ message: "ต้องใส่ tag" })
  tagStores: number[];

  @ValidateNested()
  @Type(() => StoreImageDto)
  @IsNotEmpty({ message: "ต้องใส่รูปภาพ" })
  storeImage: StoreImageDto[];
}

/**
 * DTO: StoreImageDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อสร้าง Store Image
 * Input: body parameters (image, type)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class StoreImageDto {
  @IsString()
  @MaxLength(256, { message: "image ต้องไม่เกิน 256 ตัวอักษร" })
  image: string;

  @IsEnum(ImageType)
  type: ImageType;
}
