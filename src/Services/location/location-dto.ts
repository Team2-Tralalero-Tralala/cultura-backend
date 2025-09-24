import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  IsInt,
  IsPositive,
  Matches,
  IsLatitude,
  IsLongitude,
  ValidateIf,
} from "class-validator";
import { Transform } from "class-transformer";

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
  @IsPositive({ message: "เลขหมู่บ้านต้องมากกว่า 0" })
  villageNumber?: number;

  @IsOptional()
  @IsString({ message: "ซอยต้องเป็นข้อความ" })
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

  @Transform(({ value }) => (value !== null && value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber({}, { message: "latitude ต้องเป็นตัวเลข" })
  @IsLatitude({ message: "latitude ต้องเป็นค่าละติจูดที่ถูกต้อง" })
  latitude: number;

  @Transform(({ value }) => (value !== null && value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber({}, { message: "longitude ต้องเป็นตัวเลข" })
  @IsLongitude({ message: "longitude ต้องเป็นค่าลองจิจูดที่ถูกต้อง" })
  longitude: number;


  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "รายละเอียดที่อยู่ต้องไม่เกิน 60 ตัวอักษร" })
  detail: string;
}
