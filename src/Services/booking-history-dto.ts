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
import { LocationDto } from "./location/location-dto.js";
import "reflect-metadata";

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