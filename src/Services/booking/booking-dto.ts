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
 * DTO: BookingIdParamDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อใช้ bookingId ในการเรียกข้อมูล Booking
 * Input: path parameters (bookingId)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class BookingIdParamDto {
  @Expose()
  @IsNumberString({}, { message: "bookingId ต้องเป็นตัวเลข" })
  bookingId!: string;
}

/**
 * DTO: CreateBookingBodyDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อสร้าง Booking
 * Input: body parameters (packageId, totalParticipant, transferSlip, touristBankId)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
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
