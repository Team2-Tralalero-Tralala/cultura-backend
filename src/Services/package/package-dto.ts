import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  Min,
  IsEnum,
  IsOptional,
  Matches,
  ValidateNested,
  IsObject
} from "class-validator";
import { Type } from "class-transformer";
import { PackagePublishStatus, PackageApproveStatus } from "@prisma/client";
import { LocationDto } from "../location/location-dto.js";
import "reflect-metadata";


export class PackageDto {
  @IsNumber()
  @IsNotEmpty({ message: "communityId ห้ามว่าง" })
  communityId: number;

  @ValidateNested() // ✅ บอก class-validator ว่า validate field ข้างในด้วย
  @Type(() => LocationDto) // ✅ ชี้ให้แปลงเป็น LocationDto
  @IsNotEmpty({ message: "location ห้ามว่าง" })
  location: LocationDto;

  @IsNumber()
  @IsNotEmpty({ message: "overseerMemberId ห้ามว่าง" })
  overseerMemberId: number;

  @IsString()
  @IsNotEmpty({ message: "name ห้ามว่าง" })
  @MaxLength(100, { message: "name ยาวเกิน 100 ตัวอักษร" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "description ห้ามว่าง" })
  @MaxLength(500, { message: "description ยาวเกิน 500 ตัวอักษร" })
  description: string;

  @IsNumber()
  @IsNotEmpty({ message: "capacity ห้ามว่าง" })
  @Min(1, { message: "capacity ต้องมากกว่า 0" })
  capacity: number;

  @IsNumber()
  @IsNotEmpty({ message: "price ห้ามว่าง" })
  @Min(0, { message: "price ต้องไม่น้อยกว่า 0" })
  price: number;

  @IsString()
  @IsNotEmpty({ message: "warning ห้ามว่าง" })
  @MaxLength(200, { message: "warning ยาวเกิน 200 ตัวอักษร" })
  warning: string;

  @IsEnum(PackagePublishStatus, {
    message: "statusPackage ต้องเป็น PUBLISH | UNPUBLISH | DRAFT",
  })
  statusPackage: PackagePublishStatus;

  @IsEnum(PackageApproveStatus, {
    message: "statusApprove ต้องเป็น WAIT หรือ APPROVE",
  })
  statusApprove: PackageApproveStatus;

  @IsString()
  @IsNotEmpty({ message: "startDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "startDate ต้องเป็นรูปแบบ yyyy-mm-dd" })
  startDate: string;

  @IsString()
  @IsNotEmpty({ message: "dueDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "dueDate ต้องเป็นรูปแบบ yyyy-mm-dd" })
  dueDate: string;

  @IsString()
  @IsNotEmpty({ message: "facility ห้ามว่าง" })
  @MaxLength(200, { message: "facility ยาวเกิน 200 ตัวอักษร" })
  facility: string;
}

export class updatePackageDto {
  @IsNumber()
  @IsNotEmpty({ message: "communityId ห้ามว่าง" })
  @IsOptional()
  communityId?: number;

  @ValidateNested() // ✅ บอก class-validator ว่า validate field ข้างในด้วย
  @Type(() => LocationDto) // ✅ ชี้ให้แปลงเป็น LocationDto
  @IsNotEmpty({ message: "location ห้ามว่าง" })
  @IsOptional()
  location?: LocationDto;

  @IsNumber()
  @IsNotEmpty({ message: "overseerMemberId ห้ามว่าง" })
  @IsOptional()
  overseerMemberId?: number;

  @IsString()
  @IsNotEmpty({ message: "name ห้ามว่าง" })
  @MaxLength(100, { message: "name ยาวเกิน 100 ตัวอักษร" })
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty({ message: "description ห้ามว่าง" })
  @MaxLength(500, { message: "description ยาวเกิน 500 ตัวอักษร" })
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty({ message: "capacity ห้ามว่าง" })
  @Min(1, { message: "capacity ต้องมากกว่า 0" })
  @IsOptional()
  capacity?: number;

  @IsNumber()
  @IsNotEmpty({ message: "price ห้ามว่าง" })
  @Min(0, { message: "price ต้องไม่น้อยกว่า 0" })
  @IsOptional()
  price?: number;

  @IsString()
  @IsNotEmpty({ message: "warning ห้ามว่าง" })
  @MaxLength(200, { message: "warning ยาวเกิน 200 ตัวอักษร" })
  @IsOptional()
  warning?: string;

  @IsEnum(PackagePublishStatus, {
    message: "statusPackage ต้องเป็น PUBLISH | UNPUBLISH | DRAFT",
  })
  @IsOptional()
  statusPackage?: PackagePublishStatus;

  @IsEnum(PackageApproveStatus, {
    message: "statusApprove ต้องเป็น WAIT หรือ APPROVE",
  })
  @IsOptional()
  statusApprove?: PackageApproveStatus;

  @IsString()
  @IsNotEmpty({ message: "startDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "startDate ต้องเป็นรูปแบบ yyyy-mm-dd" })
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsNotEmpty({ message: "dueDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "dueDate ต้องเป็นรูปแบบ yyyy-mm-dd" })
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsNotEmpty({ message: "facility ห้ามว่าง" })
  @MaxLength(200, { message: "facility ยาวเกิน 200 ตัวอักษร" })
  @IsOptional()
  facility?: string;
}
