/*
 * DTO: backup-dto
 * วัตถุประสงค์: ตรวจสอบข้อมูลสำหรับการจัดการ backups
 * Input: query parameters สำหรับ pagination และ body สำหรับการสร้าง backup
 * Output: ผ่าน/ไม่ผ่านการตรวจสอบ พร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
import { Transform } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

/*
 * DTO: BackupQueryDto
 * คำอธิบาย: กำหนด schema สำหรับ query parameters ของการดึงข้อมูล backups
 * ใช้สำหรับ pagination และการกรองข้อมูล
 */
export class BackupQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}

/*
 * DTO: GetBackupByIdDto
 * คำอธิบาย: กำหนด schema สำหรับการดึงข้อมูล backup ตาม filename
 * ใช้สำหรับการตรวจสอบ parameter backup filename (including .zip)
 */
export class GetBackupByIdDto {
  @IsString()
  backupId?: string; // This will be the filename including .zip extension
}

/*
 * DTO: CreateBackupDto
 * คำอธิบาย: กำหนดสำหรับการสร้าง backup ใหม่
 */
export class CreateBackupDto {
}

/*
 * DTO: DeleteBackupByIdDto
 * คำอธิบาย: กำหนด schema สำหรับการลบ backup ตาม filename
 * ใช้สำหรับการตรวจสอบ parameter backup filename (including .zip)
 */
export class DeleteBackupByIdDto {
  @IsString()
  backupId?: string; // This will be the filename including .zip extension
}

/*
 * DTO: DeleteBackupsBulkDto
 * คำอธิบาย: กำหนด schema สำหรับการลบ backup หลายไฟล์พร้อมกัน
 * ใช้สำหรับการตรวจสอบ array ของ backup filenames
 */
export class DeleteBackupsBulkDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[]; // Array of backup filenames including .zip extension
}
