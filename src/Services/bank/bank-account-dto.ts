import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class BankAccountDto {
  @IsString()
  @IsNotEmpty({ message: "ชื่อธนาคารห้ามว่าง" })
  @MaxLength(45, { message: "ชื่อธนาคารต้องไม่เกิน 45 ตัวอักษร" })
  bankName: string;

  @IsString()
  @IsNotEmpty({ message: "ชื่อบัญชีห้ามว่าง" })
  @MaxLength(45, { message: "ชื่อบัญชีห้องพักต้องไม่เกิน 45 ตัวอักษร" })
  accountName: string;

  @IsString()
  @IsNotEmpty({ message: "หมายเลขบัญชีห้ามว่าง" })
  @MaxLength(45, { message: "หมายเลขบัญช่ีห้องพักต้องไม่เกิน 45 ตัวอักษร" })
  accountNumber: string;
}
