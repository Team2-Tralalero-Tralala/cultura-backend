import { IsEmail, IsInt, IsOptional, IsString, IsUrl, Length, Matches, Min } from "class-validator";
import { Transform } from "class-transformer";

// สมัครสมาชิก
export class SignupDto {
  @IsInt({ message: "roleId must be a number" })
  @Min(1, { message: "roleId must be a positive number" })
  roleId!: number;

  @IsString() @Length(1, 100)
  fname!: string;

  @IsString() @Length(1, 100)
  lname!: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9._-]{3,30}$/, { message: "username must be 3–30 chars, A-Z a-z 0-9 . _ - only" })
  username!: string;
  
  @IsEmail()
  email!: string;

  // ลบช่องว่างก่อนตรวจ
  @Transform(({ value }) => String(value ?? "").replace(/\s+/g, ""))
  @Matches(/^[0-9]{9,15}$/, { message: "phone must be 9–15 digits" })
  phone!: string;

  @IsString() @Length(8, 100, { message: "password must be at least 8 characters" })
  password!: string;

  @IsOptional() @IsUrl()
  avatarUrl?: string | null;
}

// แก้ไขบัญชี (ทุกฟิลด์ optional)
export class EditAccountDto {
  @IsOptional() @IsInt() @Min(1)
  roleId?: number;

  @IsOptional() @IsString() @Length(1, 100)
  fname?: string;

  @IsOptional() @IsString() @Length(1, 100)
  lname?: string;

  @IsOptional()
  @Transform(({ value }) => String(value ?? "").replace(/\s+/g, ""))
  @Matches(/^[0-9]{9,15}$/, { message: "phone must be 9–15 digits" })
  phone?: string;

  @IsOptional() @IsUrl()
  avatarUrl?: string | null;
}
