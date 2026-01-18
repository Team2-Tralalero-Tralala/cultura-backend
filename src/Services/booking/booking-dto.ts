/*
 * คำอธิบาย : DTO สำหรับการสร้าง Booking History
 * รองรับการสร้างข้อมูลการจองโดยระบุแพ็กเกจและผู้จอง
 */
import { Expose } from "class-transformer";
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

/**
 * DTO สำหรับ path parameter (bookingId)
 */
export class BookingIdParamDto {
  @Expose()
  @IsNumberString({}, { message: "bookingId ต้องเป็นตัวเลข" })
  bookingId!: string;
}

/**
 * DTO สำหรับ body ของการสร้าง Booking
 * - packageId: รหัสแพ็กเกจที่ต้องการจอง
 * - totalParticipant: จำนวนผู้เข้าร่วม
 * - transferSlip: หลักฐานการโอนเงิน (optional)
 * - touristBankId: รหัสบัญชีธนาคารของนักท่องเที่ยว (optional)
 */
export class CreateBookingBodyDto {
  @Expose()
  @IsNotEmpty({ message: "packageId ห้ามว่าง" })
  @IsNumber({}, { message: "packageId ต้องเป็นตัวเลข" })
  packageId!: number;

  @Expose()
  @IsNotEmpty({ message: "totalParticipant ห้ามว่าง" })
  @IsInt({ message: "totalParticipant ต้องเป็นจำนวนเต็ม" })
  @Min(1, { message: "totalParticipant ต้องมากกว่าหรือเท่ากับ 1" })
  totalParticipant!: number;

  @Expose()
  @IsOptional()
  @IsString({ message: "transferSlip ต้องเป็นข้อความ" })
  @MaxLength(256, { message: "transferSlip ยาวเกิน 256 ตัวอักษร" })
  transferSlip?: string;

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: "touristBankId ต้องเป็นตัวเลข" })
  touristBankId?: number;
}
