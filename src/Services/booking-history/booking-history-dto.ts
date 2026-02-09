import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsNumber,
    IsEnum,
    IsDate,
    IsOptional,
    IsInt,
    Min,
} from "class-validator";
import { Type } from "class-transformer";
import { BookingStatus } from "@prisma/client";
import "reflect-metadata";
/**
 * DTO: BookingHistoryDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อสร้าง Booking History
 * Input: body parameters (touristId, packageId, bookingAt, cancelAt, refundAt, status, totalParticipant, rejectReason, tranferSlip)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class BookingHistoryDto {
    @IsNumber()
    @IsNotEmpty({ message: "touristId ห้ามว่าง" })
    touristId: number;

    @IsNumber()
    @IsNotEmpty({ message: "packageId ห้ามว่าง" })
    packageId: number;

    @IsDate()
    @Type(() => Date) // แปลง string -> Date
    @IsNotEmpty({ message: "bookingAt ห้ามว่าง" })
    bookingAt: Date; // Time Stamp

    @IsDate()
    @IsOptional()
    @Type(() => Date) // แปลง string -> Date
    // @IsNotEmpty({ message: "cancelAt ห้ามว่าง" })
    cancelAt?: Date; // Time Stamp

    @IsDate()
    @IsOptional()
    @Type(() => Date) // แปลง string -> Date
    // @IsNotEmpty({ message: "refundAt ห้ามว่าง" })
    refundAt?: Date; // Time Stamp

    @IsEnum(BookingStatus, {
        message: "statusPackage ต้องเป็น PENDING | REFUND_PENDING | REFUNDED | BOOKED | CANCELLED",
    })
    @IsOptional()
    status?: BookingStatus;

    @IsNumber()
    @IsNotEmpty({ message: "totalParticipant ห้ามว่าง" })
    totalParticipant: number;

    @IsString()
    @IsOptional()
    @IsNotEmpty({ message: "rejectReason ห้ามว่าง" })
    @MaxLength(100, { message: "rejectReason ยาวเกิน 100 ตัวอักษร" })
    rejectReason?: string;

    @IsString()
    @IsNotEmpty({ message: "tranferSlip ห้ามว่าง" })
    @MaxLength(100, { message: "tranferSlip ยาวเกิน 256 ตัวอักษร" })
    tranferSlip: string;
}

export class GetBookingQuery {
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class GetBookingMemberQuery {
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string; 

  @IsOptional()
  @IsString()
  status?: string; 
}