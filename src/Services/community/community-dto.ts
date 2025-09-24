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
} from "class-validator";
import { CommunityStatus } from "@prisma/client";
import { LocationDto } from "../location/location-dto.js";
import {
  HomestayDto,
  HomestayWithLocationDto,
} from "../homestay/homestay-dto.js";
import { StoreDto, StoreWithLocationDto } from "../store/store-dto.js";

export class CommunityDto {
  @IsString({ message: "name ต้องเป็น string" })
  @IsNotEmpty({ message: "name ห้ามว่าง" })
  @MaxLength(150, { message: "name ยาวเกิน 150 ตัวอักษร" })
  name: string; // ct_name

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "alias ยาวเกิน 100 ตัวอักษร" })
  alias?: string | null; // ct_alias

  @IsString()
  @IsNotEmpty({ message: "type ห้ามว่าง" })
  @MaxLength(90, { message: "type ยาวเกิน 90 ตัวอักษร" })
  type: string; // ct_type

  @IsString()
  @IsNotEmpty({ message: "registerNumber ห้ามว่าง" })
  @MaxLength(45, { message: "registerNumber ยาวเกิน 45 ตัวอักษร" })
  registerNumber: string; // ct_register_number

  @IsDate({ message: "registerDate ต้องเป็นวันที่" })
  @IsNotEmpty({ message: "registerDate ห้ามว่าง" })
  @Type(() => Date)
  registerDate: Date; // ct_register_date

  @IsString()
  @IsNotEmpty({ message: "description ห้ามว่าง" })
  @MaxLength(200, { message: "description ยาวเกิน 200 ตัวอักษร" })
  description: string; // ct_description

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
  @IsNotEmpty({ message: "bank ห้ามว่าง" })
  @MaxLength(100, { message: "bank ยาวเกิน 100 ตัวอักษร" })
  bank: string; // ct_bank

  @IsString()
  @IsNotEmpty({ message: "bankAccountName ห้ามว่าง" })
  @MaxLength(70, { message: "bankAccountName ยาวเกิน 70 ตัวอักษร" })
  bankAccountName: string; // ct_bank_account_name

  @IsString()
  @IsNotEmpty({ message: "bankAccountNumber ห้ามว่าง" })
  @Matches(/^[0-9]+$/, { message: "bankAccountNumber ต้องเป็นตัวเลขเท่านั้น" })
  @Length(10, 20, { message: "bankAccountNumber ต้องมี 10-20 หลัก" })
  bankAccountNumber: string; // ct_bank_account_number

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "mainAdmin ยาวเกิน 100 ตัวอักษร" })
  mainAdmin?: string; // ct_main_admin

  @IsString()
  @IsOptional()
  @Length(9, 10, { message: "mainAdminPhone ต้องมี 9-10 หลัก" })
  @Matches(/^[0-9]+$/, { message: "mainAdminPhone ต้องเป็นตัวเลขเท่านั้น" })
  mainAdminPhone?: string; // ct_main_admin_phone

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
}

export class CommunityFormDto extends CommunityDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ValidateNested({ each: true })
  @Type(() => HomestayDto)
  homestay: HomestayWithLocationDto[];

  @ValidateNested({ each: true })
  @Type(() => StoreDto)
  store: StoreWithLocationDto[];
}
