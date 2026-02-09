import {
  ImageType,
  PackageApproveStatus,
  PackagePublishStatus,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  ArrayNotEmpty,
  ValidateIf,
  IsBoolean,
} from "class-validator";
import "reflect-metadata";
import { LocationDto } from "../location/location-dto.js";

/**
 * DTO: PackageFileDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อสร้าง Package File
 * Input: body parameters (filePath, type)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class PackageFileDto {
  @IsString()
  @IsNotEmpty({ message: "filePath ห้ามว่าง" })
  filePath!: string;

  @IsEnum(ImageType, {
    message: "ImageType ต้องเป็น COVER | GALLERY | VIDEO | LOGO",
  })
  type!: ImageType; // เพิ่ม DTO สำหรับไฟล์
}

/**
 * DTO: PackageDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อสร้าง Package
 * Input: body parameters (communityId, location, overseerMemberId, name, description, ฯลฯ)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class PackageDto {
  @IsNumber()
  @IsOptional()
  communityId: number;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty({ message: "location ห้ามว่าง" })
  location: LocationDto;

  @IsOptional()
  @IsNumber()
  overseerMemberId: number;

  @IsNumber()
  @IsOptional()
  createById: number;

  @IsString()
  @IsNotEmpty({ message: "name ห้ามว่าง" })
  @MaxLength(100, { message: "name ยาวเกิน 100 ตัวอักษร" })
  name: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "description ห้ามว่าง" })
  @MaxLength(500, { message: "description ยาวเกิน 500 ตัวอักษร" })
  description: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsNumber()
  @IsNotEmpty({ message: "capacity ห้ามว่าง" })
  @Min(1, { message: "capacity ต้องมากกว่า 0" })
  capacity: number;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsNumber()
  @IsNotEmpty({ message: "price ห้ามว่าง" })
  @Min(0, { message: "price ต้องไม่น้อยกว่า 0" })
  price: number;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
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

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "startDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "startDate ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  startDate: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "dueDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  dueDate: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "startTime ต้องเป็นรูปแบบ HH:mm" })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "endTime ต้องเป็นรูปแบบ HH:mm" })
  endTime?: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "facility ห้ามว่าง" })
  @MaxLength(200, { message: "facility ยาวเกิน 200 ตัวอักษร" })
  facility: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageFileDto)
  packageFile?: PackageFileDto[];

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "bookingOpenDate ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  bookingOpenDate?: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "bookingCloseDate ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  bookingCloseDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "openTime ต้องเป็น HH:mm" })
  openTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "closeTime ต้องเป็น HH:mm" })
  closeTime?: string;

  @IsOptional()
  @IsArray({ message: "tagIds ต้องเป็น array ของตัวเลข" })
  @ArrayUnique()
  @IsInt({ each: true, message: "tagIds ทุกตัวต้องเป็นตัวเลขจำนวนเต็ม" })
  tagIds?: number[];

  /** ---------- NEW: ที่พัก (ไม่บังคับ) ---------- */
  @IsOptional()
  @IsInt()
  homestayId?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "homestayCheckInDate ต้องเป็น yyyy-mm-dd",
  })
  homestayCheckInDate?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: "homestayCheckInTime ต้องเป็น HH:mm" })
  homestayCheckInTime?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "homestayCheckOutDate ต้องเป็น yyyy-mm-dd",
  })
  homestayCheckOutDate?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: "homestayCheckOutTime ต้องเป็น HH:mm" })
  homestayCheckOutTime?: string;
}

/**
 * DTO: updatePackageDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (communityId, location, overseerMemberId, name, price, location)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class updatePackageDto {
  @IsNumber()
  @IsOptional()
  communityId?: number;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsNumber()
  @IsNotEmpty({ message: "overseerMemberId ห้ามว่าง" })
  overseerMemberId?: number;

  @IsString()
  @IsNotEmpty({ message: "name ห้ามว่าง" })
  @MaxLength(100, { message: "name ยาวเกิน 100 ตัวอักษร" })
  name?: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "description ห้ามว่าง" })
  @MaxLength(500, { message: "description ยาวเกิน 500 ตัวอักษร" })
  description?: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsNumber()
  @IsNotEmpty({ message: "capacity ห้ามว่าง" })
  @Min(1, { message: "capacity ต้องมากกว่า 0" })
  capacity?: number;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsNumber()
  @IsNotEmpty({ message: "price ห้ามว่าง" })
  @Min(0, { message: "price ต้องไม่น้อยกว่า 0" })
  price?: number;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "warning ห้ามว่าง" })
  @MaxLength(200, { message: "warning ยาวเกิน 200 ตัวอักษร" })
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

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "startDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "startDate ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  startDate!: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "dueDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  dueDate!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "startTime ต้องเป็น HH:mm" })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "endTime ต้องเป็น HH:mm" })
  endTime?: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "bookingOpenDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "bookingOpenDate ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  bookingOpenDate!: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "bookingCloseDate ห้ามว่าง" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "bookingCloseDate ต้องเป็นรูปแบบ yyyy-mm-dd",
  })
  bookingCloseDate!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "openTime ต้องเป็น HH:mm" })
  openTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "closeTime ต้องเป็น HH:mm" })
  closeTime?: string;

  @ValidateIf((dtoObject) => dtoObject.statusPackage !== "DRAFT")
  @IsString()
  @IsNotEmpty({ message: "facility ห้ามว่าง" })
  @MaxLength(200, { message: "facility ยาวเกิน 200 ตัวอักษร" })
  facility?: string;

  @IsArray({ message: "packageFile ต้องเป็น array" })
  @ValidateNested({ each: true })
  @Type(() => PackageFileDto)
  @IsOptional()
  packageFile?: PackageFileDto[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  tagIds?: number[];

  /** ---------- NEW: homestay ---------- */
  @IsOptional()
  @IsInt()
  homestayId?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  homestayCheckInDate?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  homestayCheckInTime?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  homestayCheckOutDate?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  homestayCheckOutTime?: string;

  @IsOptional()
  @IsInt({ message: "bookedRoom ต้องเป็นตัวเลข" })
  @Min(1, { message: "bookedRoom ต้องอย่างน้อย 1" })
  bookedRoom?: number;
}

/**
 * DTO: PackageIdParamDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class PackageIdParamDto {
  @IsNumberString()
  id?: string;
}

/**
 * DTO: PackageDuplicateParamDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class PackageDuplicateParamDto {
  @IsNumberString()
  packageId?: string;
}

/**
 * DTO: QueryHomestaysDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class QueryHomestaysDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}

/**
 * DTO: MembersQueryDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class MembersQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}

/**
 * DTO: QueryListHomestaysDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class QueryListHomestaysDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 8;
}

/**
 * DTO: IdParamDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class IdParamDto {
  @IsNumberString()
  communityId?: string;
}

/**
 * DTO: BulkDeletePackagesDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class BulkDeletePackagesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ids!: number[];
}

/**
 * DTO: HistoryPackageQueryDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class HistoryPackageQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  search?: string;
}

/**
 * DTO: UpdateParticipantStatusBodyDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class UpdateParticipantStatusBodyDto {
  @IsBoolean()
  isParticipate?: boolean;
}

/**
 * DTO: BookingHistoryIdParamDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class BookingHistoryIdParamDto {
  @IsNumberString()
  bookingHistoryId?: string;
}
/**
 * DTO: ParticipantsQueryDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อแก้ไข Package
 * Input: body parameters (id)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class ParticipantsQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  searchName?: string;
}
