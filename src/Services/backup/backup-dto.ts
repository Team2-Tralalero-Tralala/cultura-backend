import { Transform } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

/**
 * DTO: BackupQueryDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อดึงข้อมูล Backups
 * Input: query parameters (page, limit, search)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
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

/**
 * DTO: GetBackupByIdDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อดึงข้อมูล Backup ตาม filename
 * Input: body parameters (backupId)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class GetBackupByIdDto {
  @IsString()
  backupId?: string; // This will be the filename including .zip extension
}

/**
 * DTO: CreateBackupDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อสร้าง Backup ใหม่
 * Input: body parameters (backupId)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class CreateBackupDto {
}

/**
 * DTO: DeleteBackupByIdDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อลบ Backup ตาม filename
 * Input: body parameters (backupId)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class DeleteBackupByIdDto {
  @IsString()
  backupId?: string; // This will be the filename including .zip extension
}

/**
 * DTO: DeleteBackupsBulkDto
 * วัตถุประสงค์: ตรวจสอบข้อมูลเมื่อลบ Backup หลายไฟล์พร้อมกัน
 * Input: body parameters (ids)
 * Output: ผ่านการตรวจสอบพร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class DeleteBackupsBulkDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[]; // Array of backup filenames including .zip extension
}
