import { Expose, Type } from "class-transformer";
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { Gender, UserStatus } from "@prisma/client";


/**
 * DTO: IdParamDto
 * วัตถุประสงค์: ตรวจสอบพารามิเตอร์ userId สำหรับ endpoint ที่ต้องระบุ id
 * Input: body parameters (userId)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class IdParamDto {
  @Expose()
  @IsString({ message: "userId ต้องเป็นตัวเลขในรูปแบบ string" })
  userId?: string;
}

/**
 * DTO : CreateAccountDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับสร้างบัญชีผู้ใช้ใหม่
 * Input : req.body - roleId, memberOfCommunity, profileImage, username, email, password, fname, lname, phone, gender, birthDate, subDistrict, district, province, postalCode, activityRole, status
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export class CreateAccountDto {
  @IsNumber()
  @Type(() => Number)
  roleId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  memberOfCommunity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  profileImage?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  username!: string;

  @IsEmail()
  @MaxLength(65)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fname!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lname!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  phone?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  subDistrict?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  activityRole?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

