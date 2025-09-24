import {
  IsDate,
  IsEmail,
  IsString,
  IsEnum,
  IsNotEmpty,
  IsDecimal,
  MaxLength,
  IsOptional,
  IsNumber,
} from "class-validator";
import { CommunityStatus } from "@prisma/client";
import prisma from "./database-service.js";

export class CommunityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string; // ct_name

  @IsString()
  @IsOptional()
  @MaxLength(100)
  alias?: string; // ct_alias

  @IsString()
  @IsNotEmpty()
  @MaxLength(90)
  type: string; // ct_type

  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  registerNumber: string; // ct_register_number

  @IsDate()
  @IsNotEmpty()
  registerDate: Date; // ct_register_date

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string; // ct_description

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  mainActivityName: string; // ct_main_activity_name

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  mainActivityDes: string; // ct_main_activity_description

  @IsEnum(CommunityStatus)
  @IsNotEmpty()
  status: CommunityStatus; // ct_status

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  phone: string; // ct_phone

  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: "rating ต้องเป็นตัวเลขทศนิยม" }
  )
  @IsNotEmpty()
  rating: number; // ✅ number รองรับทศนิยม
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(65)
  email: string; // ct_email

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bank: string; // ct_bank

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  bankAccountName: string; // ct_bank_account_name

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  bankAccountNumber: string; // ct_bank_account_number

  @IsString()
  @IsOptional()
  @MaxLength(100)
  mainAdmin?: string; // ct_main_admin

  @IsString()
  @IsOptional()
  @MaxLength(10)
  mainAdminPhone?: string; // ct_main_admin_phone

  @IsString()
  @IsOptional()
  @MaxLength(150)
  coordinatorName?: string; // ct_coordinator_name

  @IsString()
  @IsOptional()
  @MaxLength(10)
  coordinatorPhone?: string; // ct_coordinator_phone

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlWebsite?: string; // ct_url_website

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlFacebook?: string; // ct_url_facebook

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlLine?: string; // ct_url_line

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlTiktok?: string; // ct_url_tiktok

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlOther?: string; // ct_url_other
}
