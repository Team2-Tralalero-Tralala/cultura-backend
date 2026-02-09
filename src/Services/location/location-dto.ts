import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsPositive,
  Matches,
  IsLatitude,
  IsLongitude,
  IsInt,
} from "class-validator";
/**
 * DTO: LocationDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อสร้าง Location
 * Input: body parameters (houseNumber, villageNumber, alley, subDistrict, district, province, postalCode, latitude, longitude, detail)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class LocationDto {
  @IsString()
  @IsNotEmpty({ message: "บ้านเลขที่ห้ามว่าง" })
  @MaxLength(10, { message: "บ้านเลขที่ต้องไม่เกิน 10 ตัวอักษร" })
  @Matches(/^[0-9A-Za-z/]+$/, {
    message: "บ้านเลขที่ต้องเป็นตัวเลข ตัวอักษร หรือ / เท่านั้น",
  })
  houseNumber: string;

  @IsOptional()
  @IsInt({ message: "เลขหมู่บ้านต้องเป็นจำนวนเต็ม" })
  villageNumber?: number | null;

  @IsString({ message: "ซอยต้องเป็นข้อความ" })
  @IsOptional()
  @MaxLength(60, { message: "ชื่อซอยต้องไม่เกิน 60 ตัวอักษร" })
  alley?: string;

  @IsString()
  @IsNotEmpty({ message: "ตำบล/แขวงห้ามว่าง" })
  @MaxLength(60, { message: "ตำบล/แขวงต้องไม่เกิน 60 ตัวอักษร" })
  subDistrict: string;

  @IsString()
  @IsNotEmpty({ message: "อำเภอ/เขตห้ามว่าง" })
  @MaxLength(60, { message: "อำเภอ/เขตต้องไม่เกิน 60 ตัวอักษร" })
  district: string;

  @IsString()
  @IsNotEmpty({ message: "จังหวัดห้ามว่าง" })
  @MaxLength(60, { message: "จังหวัดต้องไม่เกิน 60 ตัวอักษร" })
  province: string;

  @IsString()
  @IsNotEmpty({ message: "รหัสไปรษณีย์ห้ามว่าง" })
  @Matches(/^[0-9]{5}$/, { message: "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก" })
  postalCode: string;

  @IsOptional()
  @IsLatitude({ message: "ละติจูดไม่ถูกต้อง" })
  latitude: number;

  @IsOptional()
  @IsLongitude({ message: "ลองจิจูดไม่ถูกต้อง" })
  longitude: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "รายละเอียดที่อยู่ต้องไม่เกิน 100 ตัวอักษร" })
  detail?: string | null;
}
