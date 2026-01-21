/*
 * คำอธิบาย : Controller สำหรับการจัดการ Backups
 * ประกอบด้วยการดึงข้อมูล backups แบบ paginated และการสร้าง backup ใหม่
 * - superadmin เท่านั้นที่สามารถเข้าถึงได้
 * - รองรับการ pagination สำหรับการแสดงรายการ backups
 * - รองรับการสร้าง backup ใหม่ของระบบ
 */
import * as BackupService from "~/Services/backup/backup-service.js";

import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import {
  BackupQueryDto,
  CreateBackupDto,
  DeleteBackupByIdDto,
  DeleteBackupsBulkDto,
  GetBackupByIdDto,
} from "~/Services/backup/backup-dto.js";

// Define backup info type to match service
interface BackupInfo {
  filename: string; // includes .zip extension
  size: string;
  status: string; // always "completed"
  createdAt: Date;
}

/*
 * DTO : getBackupsDto
 * คำอธิบาย : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint GET /backups
 * Input : query (BackupQueryDto) - pagination parameters
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const getBackupsDto = {
  query: BackupQueryDto,
} satisfies commonDto;

/*
 * DTO : getBackupByIdDto
 * คำอธิบาย : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint GET /backups/:backupId
 * Input : params (GetBackupByIdDto) - backup ID parameter
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const getBackupByIdDto = {
  params: GetBackupByIdDto,
} satisfies commonDto;

/*
 * DTO : createBackupDto
 * คำอธิบาย : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint POST /backups
 * Input : body (CreateBackupDto) - backup configuration parameters
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const createBackupDto = {
  body: CreateBackupDto,
} satisfies commonDto;

/*
 * DTO : deleteBackupByIdDto
 * คำอธิบาย : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint DELETE /backups/:backupId
 * Input : params (DeleteBackupByIdDto) - backup ID parameter
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const deleteBackupByIdDto = {
  params: DeleteBackupByIdDto,
} satisfies commonDto;

/*
 * DTO : deleteBackupsBulkDto
 * คำอธิบาย : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint POST /backups/delete-bulk
 * Input : body (DeleteBackupsBulkDto) - array ของ backup IDs
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const deleteBackupsBulkDto = {
  body: DeleteBackupsBulkDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getBackups
 * คำอธิบาย : Handler สำหรับดึงข้อมูล backups แบบ paginated
 * Input :
 *   - req.query - pagination parameters (ผ่านการ validate ด้วย getBackupsDto แล้ว)
 *   - req.user - ข้อมูลผู้ใช้จาก auth middleware
 * Output :
 *   - 200 OK พร้อมข้อมูล backups และ pagination metadata
 *   - 401 Unauthorized ถ้าไม่มีการ authenticate
 *   - 403 Forbidden ถ้าไม่มีสิทธิ์ superadmin
 *   - 400 Bad Request ถ้ามี error
 * Logic :
 *   - superadmin เท่านั้นที่สามารถเข้าถึงได้
 *   - รองรับการ pagination
 */
export const getBackups: TypedHandlerFromDto<typeof getBackupsDto> = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }

    const { page = 1, limit = 10, search } = req.query;

    const result = await BackupService.getBackups(page, limit, search);

    return createResponse(res, 200, "Backups retrieved successfully", result);
  } catch (error) {
    console.error("Error in getBackups:", error);
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : getBackupById
 * คำอธิบาย : Handler สำหรับ download backup file ตาม filename
 * Input :
 *   - req.params - backup filename parameter (ผ่านการ validate ด้วย getBackupByIdDto แล้ว)
 *   - req.user - ข้อมูลผู้ใช้จาก auth middleware
 * Output :
 *   - 200 OK พร้อมไฟล์ backup
 *   - 401 Unauthorized ถ้าไม่มีการ authenticate
 *   - 403 Forbidden ถ้าไม่มีสิทธิ์ superadmin
 *   - 404 Not Found ถ้าไม่พบ backup file
 *   - 400 Bad Request ถ้ามี error
 * Logic :
 *   - superadmin เท่านั้นที่สามารถเข้าถึงได้
 *   - download backup file ตาม filename ที่ระบุ
 */
export const getBackupById = async (req: any, res: any) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }

    const { backupId } = req.params;

    if (!backupId) {
      return createErrorResponse(res, 400, "Backup filename is required");
    }

    const filePath = await BackupService.getBackupById(backupId);

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="${backupId}"`);
    res.setHeader("Content-Type", "application/zip");

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error in getBackupById:", error);
    if ((error as Error).message.includes("not found")) {
      return createErrorResponse(res, 404, (error as Error).message);
    }
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : createBackup
 * คำอธิบาย : Handler สำหรับการสร้าง backup ใหม่
 * Input :
 *   - req.body - backup configuration parameters (ผ่านการ validate ด้วย createBackupDto แล้ว)
 *   - req.user - ข้อมูลผู้ใช้จาก auth middleware
 * Output :
 *   - 201 Created พร้อมข้อมูล backup ที่สร้างใหม่
 *   - 401 Unauthorized ถ้าไม่มีการ authenticate
 *   - 403 Forbidden ถ้าไม่มีสิทธิ์ superadmin
 *   - 400 Bad Request ถ้ามี error
 * Logic :
 *   - superadmin เท่านั้นที่สามารถเข้าถึงได้
 *   - สร้าง backup ตาม configuration ที่ระบุ
 */
export const createBackup: TypedHandlerFromDto<typeof createBackupDto> = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }

    const backupConfig = req.body;

    const result = await BackupService.createBackup();

    return createResponse(res, 201, "Backup created successfully", result);
  } catch (error) {
    console.error("Error in createBackup:", error);
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : deleteBackupById
 * คำอธิบาย : Handler สำหรับลบ backup file ตาม filename
 * Input :
 *   - req.params - backup filename parameter (ผ่านการ validate ด้วย deleteBackupByIdDto แล้ว)
 *   - req.user - ข้อมูลผู้ใช้จาก auth middleware
 * Output :
 *   - 200 OK พร้อมข้อความสำเร็จ
 *   - 401 Unauthorized ถ้าไม่มีการ authenticate
 *   - 403 Forbidden ถ้าไม่มีสิทธิ์ superadmin
 *   - 404 Not Found ถ้าไม่พบ backup file
 *   - 400 Bad Request ถ้ามี error
 * Logic :
 *   - superadmin เท่านั้นที่สามารถเข้าถึงได้
 *   - ลบ backup file ตาม filename ที่ระบุ
 */
export const deleteBackupById: TypedHandlerFromDto<
  typeof deleteBackupByIdDto
> = async (req, res) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }

    const { backupId } = req.params;

    if (!backupId) {
      return createErrorResponse(res, 400, "Backup filename is required");
    }

    const result = await BackupService.deleteBackupById(backupId);

    return createResponse(res, 200, result.message, result);
  } catch (error) {
    console.error("Error in deleteBackupById:", error);
    if ((error as Error).message.includes("not found")) {
      return createErrorResponse(res, 404, (error as Error).message);
    }
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : deleteBackupsBulk
 * คำอธิบาย : Handler สำหรับลบ backup files หลายไฟล์พร้อมกัน
 * Input :
 *   - req.body - array ของ backup filenames (ผ่านการ validate ด้วย deleteBackupsBulkDto แล้ว)
 *   - req.user - ข้อมูลผู้ใช้จาก auth middleware
 * Output :
 *   - 200 OK พร้อมรายละเอียดการลบ
 *   - 401 Unauthorized ถ้าไม่มีการ authenticate
 *   - 403 Forbidden ถ้าไม่มีสิทธิ์ superadmin
 *   - 400 Bad Request ถ้ามี error
 * Logic :
 *   - superadmin เท่านั้นที่สามารถเข้าถึงได้
 *   - ลบ backup files หลายไฟล์พร้อมกัน
 */
export const deleteBackupsBulk: TypedHandlerFromDto<
  typeof deleteBackupsBulkDto
> = async (req, res) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse(
        res,
        400,
        "Backup IDs array is required and cannot be empty"
      );
    }

    const result = await BackupService.deleteBackupsBulk(ids);

    return createResponse(res, 200, result.message, result);
  } catch (error) {
    console.error("Error in deleteBackupsBulk:", error);
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
