// src/Validators/account.dto.ts
import {
  IsString,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
} from "class-validator";

/** กติกา:
 *  - fname/lname: 1–100 ตัวอักษร
 *  - username: เริ่มด้วยตัวอักษร [a-z] ตามด้วย [a-z0-9_] รวม 3–30 ตัว
 *  - email: รูปแบบอีเมล
 *  - phone: เบอร์ไทย 10 หลักขึ้นต้น 0 (เช่น 0812345678)
 *  - password: อย่างน้อย 8 ตัวอักษร
 *  - roleId, memberOfCommunity: เลขจำนวนเต็มบวก
 */

export class CreateAccountDto {
  @IsInt()
  @Min(1)
  roleId!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fname!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lname!: string;

  @IsString()
  @Matches(/^[a-z][a-z0-9_]{2,29}$/i, {
    message:
      "username must start with a letter and contain only letters, numbers, and underscores (3-30 chars)",
  })
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^0\d{9}$/, { message: "phone must be 10 digits and start with 0" })
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  memberOfCommunity?: number;
}

export class EditAccountDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  roleId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fname?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lname?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{2,29}$/i, {
    message:
      "username must start with a letter and contain only letters, numbers, and underscores (3-30 chars)",
  })
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^0\d{9}$/, { message: "phone must be 10 digits and start with 0" })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  memberOfCommunity?: number;
}
