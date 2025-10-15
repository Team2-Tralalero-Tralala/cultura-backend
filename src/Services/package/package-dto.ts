import { Type } from "class-transformer";
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
    IsObject,
    IsArray
} from "class-validator";
import { PackagePublishStatus, PackageApproveStatus, ImageType } from "@prisma/client";
import { LocationDto } from "../location/location-dto.js";
import "reflect-metadata";


/*
 * คำอธิบาย : Data Transfer Object (DTO) สำหรับข้อมูลไฟล์ที่แนบกับ Package
 * Input  : filePath (string), type (ImageType)
 * Output : ใช้สำหรับ validate ข้อมูลไฟล์ก่อนบันทึกลงฐานข้อมูล
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

/*
 * คำอธิบาย : DTO สำหรับการสร้าง Package ใหม่
 * ใช้ตรวจสอบความถูกต้องของข้อมูลจาก Client ก่อนบันทึกลงฐานข้อมูล
 * Input : JSON body ที่มีข้อมูล communityId, location, overseerMemberId, name, description, ฯลฯ
 * Output : Object PackageDto ที่ผ่านการ validate แล้ว
 */
export class PackageDto {
    @IsNumber()
    @IsOptional()
    communityId: number;

    @ValidateNested() //  บอก class-validator ว่า validate field ข้างในด้วย
    @Type(() => LocationDto) //  ชี้ให้แปลงเป็น LocationDto
    @IsNotEmpty({ message: "location ห้ามว่าง" })
    location: LocationDto;

    @IsNumber()
    @IsNotEmpty({ message: "overseerMemberId ห้ามว่าง" })
    overseerMemberId: number;

    @IsNumber()
    @IsOptional()
    createById: number;

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

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: "startTime ต้องเป็นรูปแบบ HH:mm" })
    startTime?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: "endTime ต้องเป็นรูปแบบ HH:mm" })
    endTime?: string;

    @IsString()
    @IsNotEmpty({ message: "facility ห้ามว่าง" })
    @MaxLength(200, { message: "facility ยาวเกิน 200 ตัวอักษร" })
    facility: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PackageFileDto)
    packageFile?: PackageFileDto[];
}

/*
 * คำอธิบาย : DTO สำหรับการแก้ไข Package เดิม
 * ฟิลด์ทั้งหมดเป็น Optional (เลือกแก้ได้) แต่ยังคงตรวจสอบรูปแบบตาม Validation rule
 * Input : JSON body ที่มีข้อมูล field ใดๆ ที่ต้องการแก้ เช่น name, price, location
 * Output : Object updatePackageDto ที่ผ่านการ validate แล้ว
 */
export class updatePackageDto {
    @IsNumber()
    @IsOptional()
    communityId?: number;

    @ValidateNested() // บอก class-validator ว่า validate field ข้างในด้วย
    @Type(() => LocationDto) // ชี้ให้แปลงเป็น LocationDto
    location?: LocationDto;

    @IsNumber()
    @IsNotEmpty({ message: "overseerMemberId ห้ามว่าง" })
    overseerMemberId?: number;

    @IsString()
    @IsNotEmpty({ message: "name ห้ามว่าง" })
    @MaxLength(100, { message: "name ยาวเกิน 100 ตัวอักษร" })
    name?: string;

    @IsString()
    @IsNotEmpty({ message: "description ห้ามว่าง" })
    @MaxLength(500, { message: "description ยาวเกิน 500 ตัวอักษร" })
    description?: string;

    @IsNumber()
    @IsNotEmpty({ message: "capacity ห้ามว่าง" })
    @Min(1, { message: "capacity ต้องมากกว่า 0" })
    capacity?: number;

    @IsNumber()
    @IsNotEmpty({ message: "price ห้ามว่าง" })
    @Min(0, { message: "price ต้องไม่น้อยกว่า 0" })
    price?: number;

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

    @IsString()
    @IsNotEmpty({ message: "startDate ห้ามว่าง" })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "startDate ต้องเป็นรูปแบบ yyyy-mm-dd" })
    startDate!: string;

    @IsString()
    @IsNotEmpty({ message: "dueDate ห้ามว่าง" })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "dueDate ต้องเป็นรูปแบบ yyyy-mm-dd" })
    dueDate!: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: "startTime ต้องเป็น HH:mm" })
    startTime?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: "endTime ต้องเป็น HH:mm" })
    endTime?: string;

        @IsString()
    @IsNotEmpty({ message: "openBookingAt ห้ามว่าง" })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "openBookingAt ต้องเป็นรูปแบบ yyyy-mm-dd" })
    openBookingAt!: string;

    @IsString()
    @IsNotEmpty({ message: "closeBookingAt ห้ามว่าง" })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "closeBookingAt ต้องเป็นรูปแบบ yyyy-mm-dd" })
    closeBookingAt!: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: "openTime ต้องเป็น HH:mm" })
    openTime?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: "closeTime ต้องเป็น HH:mm" })
    closeTime?: string;

    @IsString()
    @IsNotEmpty({ message: "facility ห้ามว่าง" })
    @MaxLength(200, { message: "facility ยาวเกิน 200 ตัวอักษร" })
    facility?: string;

    @IsArray({ message: "packageFile ต้องเป็น array" })
    @ValidateNested({ each: true })
    @Type(() => PackageFileDto)
    @IsOptional()
    packageFile?: PackageFileDto[];
}