import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsString,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  IsUrl,
  Length,
  Matches,
  ValidateNested,
  Min,
  Max,
  IsInt,
} from "class-validator";
import { CommunityStatus } from "@prisma/client";
import { LocationDto } from "../location/location-dto.js";
import { HomestayDto } from "../homestay/homestay-dto.js";
import { StoreDto } from "../store/store-dto.js";
import { ImageType } from "@prisma/client";

export class CommunityDto {
  @IsNotEmpty({ message: "adminId ห้ามว่าง" })
  adminId: number;

  @IsString({ message: "name ต้องเป็น string" })
  @IsNotEmpty({ message: "name ห้ามว่าง" })
  @MaxLength(150, { message: "name ยาวเกิน 150 ตัวอักษร" })
  name: string; // ct_name

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "alias ยาวเกิน 100 ตัวอักษร" })
  alias?: string; // ct_alias

  @IsString()
  @IsNotEmpty({ message: "type ห้ามว่าง" })
  @MaxLength(90, { message: "type ยาวเกิน 90 ตัวอักษร" })
  type: string; // ct_type

  @IsString()
  @IsNotEmpty({ message: "registerNumber ห้ามว่าง" })
  @MaxLength(45, { message: "registerNumber ยาวเกิน 45 ตัวอักษร" })
  registerNumber: string; // ct_register_number

  @Type(() => Date)
  @IsDate({ message: "registerDate ต้องเป็นวันที่" })
  registerDate: Date;

  @IsString()
  @IsNotEmpty({ message: "description ห้ามว่าง" })
  @MaxLength(200, { message: "description ยาวเกิน 200 ตัวอักษร" })
  description: string; // ct_description

  @IsString()
  @IsNotEmpty({ message: "ชื่อธนาคารห้ามว่าง" })
  @MaxLength(45, { message: "ชื่อธนาคารต้องไม่เกิน 45 ตัวอักษร" })
  bankName: string;

  @IsString()
  @IsNotEmpty({ message: "ชื่อบัญชีห้ามว่าง" })
  @MaxLength(45, { message: "ชื่อบัญชีต้องไม่เกิน 45 ตัวอักษร" })
  accountName: string;

  @IsString()
  @IsNotEmpty({ message: "หมายเลขบัญชีห้ามว่าง" })
  @MaxLength(45, { message: "หมายเลขบัญชีต้องไม่เกิน 45 ตัวอักษร" })
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80, { message: "mainActivityName ยาวเกิน 80 ตัวอักษร" })
  mainActivityName: string; // ct_main_activity_name

  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: "mainActivityDescription ยาวเกิน 150 ตัวอักษร" })
  mainActivityDescription: string; // ct_main_activity_description

  @IsEnum(CommunityStatus, {
    message: "status ต้องเป็นค่า CommunityStatus เท่านั้น",
  })
  status: CommunityStatus; // ct_status

  @IsString()
  @IsNotEmpty({ message: "phone ห้ามว่าง" })
  @Length(9, 10, { message: "phone ต้องมี 9-10 หลัก" })
  @Matches(/^[0-9]+$/, { message: "phone ต้องเป็นตัวเลขเท่านั้น" })
  phone: string; // ct_phone

  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: "rating ต้องเป็นตัวเลข" }
  )
  @IsNotEmpty({ message: "rating ห้ามว่าง" })
  @Min(0, { message: "rating ต้องไม่น้อยกว่า 0" })
  @Max(5, { message: "rating ต้องไม่เกิน 5" })
  rating: number; // ✅ 0–5

  @IsEmail({}, { message: "email ไม่ถูกต้อง" })
  @IsNotEmpty({ message: "email ห้ามว่าง" })
  @MaxLength(65, { message: "email ยาวเกิน 65 ตัวอักษร" })
  email: string; // ct_email

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "mainAdmin ยาวเกิน 100 ตัวอักษร" })
  mainAdmin: string; // ct_main_admin

  @IsString()
  @IsOptional()
  @Length(9, 10, { message: "mainAdminPhone ต้องมี 9-10 หลัก" })
  @Matches(/^[0-9]+$/, { message: "mainAdminPhone ต้องเป็นตัวเลขเท่านั้น" })
  mainAdminPhone: string; // ct_main_admin_phone

  @IsString()
  @IsOptional()
  @MaxLength(150, { message: "coordinatorName ยาวเกิน 150 ตัวอักษร" })
  coordinatorName?: string; // ct_coordinator_name

  @IsString()
  @IsOptional()
  @Length(9, 10, { message: "coordinatorPhone ต้องมี 9-10 หลัก" })
  @Matches(/^[0-9]+$/, { message: "coordinatorPhone ต้องเป็นตัวเลขเท่านั้น" })
  coordinatorPhone?: string; // ct_coordinator_phone

  @IsUrl({}, { message: "urlWebsite ต้องเป็น URL ที่ถูกต้อง" })
  @IsOptional()
  @MaxLength(2048)
  urlWebsite?: string; // ct_url_website

  @IsUrl({}, { message: "urlFacebook ต้องเป็น URL ที่ถูกต้อง" })
  @IsOptional()
  @MaxLength(2048)
  urlFacebook?: string; // ct_url_facebook

  @IsUrl({}, { message: "urlLine ต้องเป็น URL ที่ถูกต้อง" })
  @IsOptional()
  @MaxLength(2048)
  urlLine?: string; // ct_url_line

  @IsUrl({}, { message: "urlTiktok ต้องเป็น URL ที่ถูกต้อง" })
  @IsOptional()
  @MaxLength(2048)
  urlTiktok?: string; // ct_url_tiktok

  @IsUrl({}, { message: "urlOther ต้องเป็น URL ที่ถูกต้อง" })
  @IsOptional()
  @MaxLength(2048)
  urlOther?: string; // ct_url_other

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ValidateNested({ each: true })
  @Type(() => HomestayDto)
  homestay?: HomestayDto[];

  @ValidateNested({ each: true })
  @Type(() => StoreDto)
  store?: StoreDto[];

  @IsOptional()
  member?: number[];

  @ValidateNested({ each: true })
  @Type(() => CommunityImageDto)
  @IsOptional()
  communityImage?: CommunityImageDto[];
}

export class CommunityImageDto {
  @IsString()
  @MaxLength(256, { message: "image ต้องไม่เกิน 256 ตัวอักษร" })
  image: string;

  @IsEnum(ImageType)
  type: ImageType;
}

export class QueryListMembersDto {
  @IsOptional()
  @IsString()
  q?: string;               // พิมคำค้นได้/ไม่ใส่ก็ได้

  @IsOptional()
  @Type(() => Number)       // แปลง "10" -> 10
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class QueryListHomestaysDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 8;
}