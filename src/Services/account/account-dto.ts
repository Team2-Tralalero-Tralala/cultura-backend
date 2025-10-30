import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";

export class CreateAccountDto {

  @IsOptional()
  @IsString()
  profileImage?: string | null;

  @IsInt()
  @IsPositive()
  roleId!: number;

  @IsString()
  @MinLength(1)
  fname!: string;

  @IsString()
  @MinLength(1)
  lname!: string;

  @IsString()
  @MinLength(3)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  /** ===== ฟิลด์เพิ่มเติมเฉพาะ Role ===== */

  // Member
  @IsOptional()
  @IsInt()
  memberOfCommunity?: number;

  // Tourist
  @IsOptional()
  @IsString()
  gender?: "MALE" | "FEMALE" | "NONE";

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  subdistrict?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class EditAccountDto {
  @IsOptional()
  @IsString()
  profileImage?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  fname?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lname?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  roleId?: number;

  /** ===== ฟิลด์เพิ่มเติมเฉพาะ Role ===== */

  // Member
  @IsOptional()
  @IsInt()
  memberOfCommunity?: number;

  // Tourist
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  subdistrict?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}
