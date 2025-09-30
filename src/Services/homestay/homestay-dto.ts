import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  ValidateNested,
  Matches,
} from "class-validator";
import { LocationDto } from "../location/location-dto.js";
import { Type } from "class-transformer";

/*
 * คำอธิบาย : Data Transfer Object (DTO) สำหรับข้อมูล Homestay
 * Fields:
 *  - name: string (ชื่อโฮมสเตย์, ความยาวไม่เกิน 60 ตัวอักษร, ห้ามว่าง)
 *  - roomType: string (ประเภทห้องพัก, ความยาวไม่เกิน 45 ตัวอักษร, ห้ามว่าง)
 *  - capacity: number (จำนวนคนที่รองรับ, ต้องเป็นจำนวนเต็ม, มากกว่า 0 และอย่างน้อย 1)
 * Output : ใช้สำหรับ validate request body ตอนสร้าง/แก้ไข Homestay
 */
export class HomestayDto {
  @IsString()
  @IsNotEmpty({ message: "ชื่อโฮมสเตย์ห้ามว่าง" })
  @MaxLength(60, { message: "ชื่อโฮมสเตย์ต้องไม่เกิน 60 ตัวอักษร" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "ประเภทห้องพักห้ามว่าง" })
  @MaxLength(45, { message: "ประเภทห้องพักต้องไม่เกิน 45 ตัวอักษร" })
  roomType: string;

  @IsNumber({}, { message: "จำนวนคนต้องเป็นตัวเลข" })
  @IsInt({ message: "จำนวนคนต้องเป็นจำนวนเต็ม" })
  @IsPositive({ message: "จำนวนคนต้องมากกว่า 0" })
  @Min(1, { message: "จำนวนคนต้องอย่างน้อย 1" })
  capacity: number;
}

/*
 * คำอธิบาย : DTO สำหรับ Homestay พร้อมข้อมูล Location
 * Fields:
 *  - location: LocationDto (รายละเอียดที่อยู่ เช่น บ้านเลขที่, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์, latitude, longitude)
 * Output : ใช้สำหรับ validate request body ที่ต้องการข้อมูล Homestay + Location
 */
export class HomestayWithLocationDto extends HomestayDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}
