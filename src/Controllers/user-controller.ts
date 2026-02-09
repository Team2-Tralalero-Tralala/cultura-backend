import { Gender, UserStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import { PasswordDto } from "~/Services/user/password-dto.js";
import {
  CreateAccountDto,
  IdParamDto,
} from "~/Services/user/user-dto.js";
import * as UserService from "../Services/user/user-service.js";

/**
 * DTO : getUserByIdDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับดึงข้อมูลผู้ใช้
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const getUserByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/**
 * คำอธิบาย :
 *   ดึงข้อมูลผู้ใช้จาก userId
 * Input :
 *   - req.params.userId (string → number)
 * Output :
 *   - 200 OK : คืนข้อมูลผู้ใช้
 *   - 404 Not Found : ไม่พบผู้ใช้
 */
export const getUserById: TypedHandlerFromDto<typeof getUserByIdDto> = async (
  req,
  res
) => {
  try {
    const userId = Number(req.params.userId);
    const userData = await UserService.getUserById(userId);
    return createResponse(res, 200, "User fetched successfully", userData);
  } catch (caughtError) {
    return createErrorResponse(res, 404, (caughtError as Error).message);
  }
};
/**
 * DTO : StatusParamDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับดึงข้อมูลผู้ใช้
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
class StatusParamDto {
  @IsEnum(UserStatus)
  status?: UserStatus;
}

/**
 * DTO : getAccountsDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับดึงข้อมูลผู้ใช้
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const getAccountsDto = {
  query: PaginationDto,
} satisfies commonDto;

/**
 * คำอธิบาย :
 *   ดึงข้อมูลผู้ใช้ทั้งหมดตามสิทธิ์ของผู้เรียก
 * Input :
 *   - req.user : ข้อมูลผู้ใช้ที่ล็อกอิน
 *   - req.query.page, req.query.limit, req.query.searchName, req.query.filterRole
 * Output :
 *   - 200 OK : คืนรายการผู้ใช้พร้อม pagination
 *   - 401 Unauthorized : ถ้าไม่มีข้อมูลผู้ใช้ที่ล็อกอิน
 */
export const getAccountAll: TypedHandlerFromDto<typeof getAccountsDto> = async (
  req,
  res
) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");
    const { page = 1, limit = 10 } = req.query;
    const userData = await UserService.getAccountAll(
      req.user,
      Number(page),
      Number(limit)
    );

    return createResponse(res, 200, "Accounts fetched successfully", userData);
  } catch (caughtError) {
    return createErrorResponse(res, 400, (caughtError as Error).message);
  }
};

/**
 * DTO : getUserByStatusDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับดึงข้อมูลผู้ใช้
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const getUserByStatusDto = {
  params: StatusParamDto,
  query: PaginationDto,
} satisfies commonDto;

/**
 * คำอธิบาย :
 *   ดึงข้อมูลผู้ใช้ตามสถานะ (ACTIVE หรือ BLOCKED)
 * Input :
 *   - req.user : ผู้ใช้ที่ล็อกอินอยู่
 *   - req.params.status : สถานะที่ต้องการดึง (ACTIVE / BLOCKED)
 *   - req.query.page, req.query.limit : สำหรับแบ่งหน้า
 * Output:
 *   - 200 OK : คืนข้อมูลผู้ใช้พร้อม pagination
 *   - 400 Bad Request : ถ้า status ไม่ถูกต้อง
 *   - 401 Unauthorized : ถ้ายังไม่ล็อกอิน
 */
export const getUserByStatus: TypedHandlerFromDto<
  typeof getUserByStatusDto
> = async (req, res) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");
    const { page = 1, limit = 10 } = req.query;
    const status = req.params.status;

    if (!status || !Object.values(UserStatus).includes(status as UserStatus)) {
      return createErrorResponse(
        res,
        400,
        "Invalid status. Must be ACTIVE or BLOCKED"
      );
    }

    const userData = await UserService.getUserByStatus(
      req.user,
      status as UserStatus,
      Number(page),
      Number(limit)
    );

    return createResponse(res, 200, "Users fetched successfully", userData);
  } catch (caughtError) {
    return createErrorResponse(res, 500, (caughtError as Error).message);
  }
};
/**
 * DTO : deleteAccountByIdDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับลบบัญชีผู้ใช้
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const deleteAccountByIdDto = { params: IdParamDto } satisfies commonDto;
/**
 * DTO : blockAccountByIdDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับบล็อกบัญชีผู้ใช้
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const blockAccountByIdDto = { params: IdParamDto } satisfies commonDto;
/**
 * DTO : unblockAccountByIdDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับยกเลิกบล็อกบัญชีผู้ใช้
 * Input : req.query - page, limit, search, statusApprove
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const unblockAccountByIdDto = { params: IdParamDto } satisfies commonDto;

/**
 * คำอธิบาย :
 *   ลบบัญชีผู้ใช้ตาม ID (soft delete)
 * Input :
 *   - req.params.userId : หมายเลขผู้ใช้
 * Output :
 *   - 200 OK : ลบสำเร็จ
 *   - 404 Not Found : ไม่พบผู้ใช้
 */
export const deleteAccountById: TypedHandlerFromDto<
  typeof deleteAccountByIdDto
> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const deletedUser = await UserService.deleteAccount(userId);
    return createResponse(res, 200, "Deleted user successfully", deletedUser);
  } catch (caughtError) {
    return createErrorResponse(res, 404, (caughtError as Error).message);
  }
};

/**
 * คำอธิบาย :
 *   ระงับบัญชีผู้ใช้ (เปลี่ยนสถานะเป็น BLOCKED)
 * Input :
 *   - req.params.userId : หมายเลขผู้ใช้
 * Output :
 *   - 200 OK : ระงับสำเร็จ
 *   - 404 Not Found : ไม่พบผู้ใช้
 */
export const blockAccountById: TypedHandlerFromDto<
  typeof blockAccountByIdDto
> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const blockedUser = await UserService.blockAccount(userId);
    return createResponse(res, 200, "User blocked successfully", blockedUser);
  } catch (caughtError) {
    return createErrorResponse(res, 404, (caughtError as Error).message);
  }
};

/**
 * คำอธิบาย :
 *   ปลดระงับบัญชีผู้ใช้ (เปลี่ยนสถานะเป็น ACTIVE)
 * Input :
 *   - req.params.userId : หมายเลขผู้ใช้
 * Output :
 *   - 200 OK : ปลดระงับสำเร็จ
 *   - 404 Not Found : ไม่พบผู้ใช้
 */
export const unblockAccountById: TypedHandlerFromDto<
  typeof unblockAccountByIdDto
> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const unblockedUser = await UserService.unblockAccount(userId);
    return createResponse(
      res,
      200,
      "User unblocked successfully",
      unblockedUser
    );
  } catch (caughtError) {
    return createErrorResponse(res, 404, (caughtError as Error).message);
  }
};
/**
 * DTO : createAccountDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับสร้างบัญชีผู้ใช้ใหม่
 * Input : req.body - roleId, memberOfCommunity, profileImage, username, email, password, fname, lname, phone, gender, birthDate, subDistrict, district, province, postalCode, activityRole, status
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const createAccountDto = {
  body: CreateAccountDto,
} satisfies commonDto;

/**
 * DTO : FileDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับอัปโหลดรูปโปรไฟล์
 * Input : req.body - userId
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export class FileDto {
  @IsNumberString()
  userId?: string;
}

/**
 * คำอธิบาย :
 *   สร้างบัญชีผู้ใช้ใหม่และบันทึกรูปโปรไฟล์
 * Input:
 *   - req.body: ข้อมูลผู้ใช้
 *   - req.file: ไฟล์รูปโปรไฟล์
 * Output:
 *   - 200 OK : สร้างบัญชีสำเร็จ
 *   - 400 Bad Request : ถ้าไม่พบไฟล์แนบ
 */
export const createAccount: TypedHandlerFromDto<
  typeof createAccountDto
> = async (req, res) => {
  try {
    const payload = req.body;
    if (!req.file) {
      return createErrorResponse(res, 400, "file not found");
    }
    const filePath = req.file.path;
    const createdUser = await UserService.createAccount(payload, filePath);
    return createResponse(res, 200, "Create User Successful", createdUser);
  } catch (caughtError) {
    return createErrorResponse(res, 404, (caughtError as Error).message);
  }
};

/**
 * คำอธิบาย :
 *   อัปเดตรูปโปรไฟล์ (ลบไฟล์เก่าแล้วบันทึกใหม่)
 * Input:
 *   - req.params.userId : หมายเลขผู้ใช้
 *   - req.file : ไฟล์ใหม่ที่อัปโหลด
 * Output:
 *   - 200 OK : อัปโหลดสำเร็จ
 *   - 400 Bad Request : ถ้าไม่พบไฟล์หรือ userId
 *   - 500 Internal Server Error : ถ้าเกิดข้อผิดพลาดในระบบ
 */
export const updateProfileImage = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const filePath = req.file ? req.file.path.replace(/\\/g, "/") : null;
    if (!userId) return createErrorResponse(res, 400, "Invalid user ID");
    if (!filePath) return createErrorResponse(res, 400, "No file uploaded");

    const oldUserData = await UserService.getUserById(userId);
    const oldImage = oldUserData?.profileImage;

    if (oldImage && oldImage.trim() !== "" && oldImage.includes(".")) {
      const oldPath = path.resolve(
        process.cwd(),
        "uploads",
        oldImage.replace(/^\//, "")
      );
      try {
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (caughtError) {
        console.warn(`ลบรูปเก่าล้มเหลว: ${(caughtError as Error).message}`);
      }
    }

    const fileName = "/" + path.basename(filePath);
    const updatedUser = await UserService.updateProfileImage(userId, fileName);
    return createResponse(res, 200, "อัปเดตรูปโปรไฟล์สำเร็จ", updatedUser);
  } catch (caughtError) {
    return createErrorResponse(res, 500, (caughtError as Error).message);
  }
};

/**
 * คำอธิบาย :
 *   แสดงข้อมูลสมาชิกที่อยู่ในชุมชนของแอดมิน
 * Input:
 *   - req.user.id : รหัสแอดมิน
 *   - req.params.userId : รหัสผู้ใช้ที่ต้องการดู
 * Output:
 *   - 200 OK : คืนข้อมูลสมาชิก
 *   - 401 Unauthorized : ถ้าไม่ได้ล็อกอิน
 *   - 403 Forbidden : ถ้าไม่ใช่สมาชิกในชุมชนของแอดมิน
 */
export const getMemberByAdmin: TypedHandlerFromDto<
  typeof getUserByIdDto
> = async (req, res) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");
    const userId = Number(req.params.userId);
    const adminId = req.user.id;
    const userData = await UserService.getMemberByAdmin(userId, adminId);
    return createResponse(res, 200, "User fetched successfully", userData);
  } catch (caughtError) {
    return createErrorResponse(res, 403, (caughtError as Error).message);
  }
};
/*
 * DTO : resetPasswordDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับรีเซ็ตรหัสผ่านใหม่
 * Input : req.params.userId, req.body.newPassword
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const resetPasswordDto = {
  params: IdParamDto,
  body: PasswordDto,
} satisfies commonDto;

/*
 * คำอธิบาย : สำหรับตั้งรหัสผ่านใหม่
 * Input :
 *   - req.params.userId : รหัสผู้ใช้ (string → number)
 *   - newPassword : รหัสผ่านใหม่
 * Output :
 *   - 200 OK พร้อมข้อมูลผู้ใช้ที่ถูกปลดบล็อค
 *   - 400 Bad request
 */
export const resetPassword: TypedHandlerFromDto<
  typeof resetPasswordDto
> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const result = await UserService.resetPassword(userId, req.body);
    return createResponse(res, 200, "Reset new password successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
/* 
 * DTO : ChangePasswordDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับเปลี่ยนรหัสผ่าน
 * Input : req.body - currentPassword, newPassword, confirmNewPassword
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export class ChangePasswordDto {
    @IsString()
    currentPassword?: string;
    
    @IsString()
    newPassword?: string;
    
    @IsString()
    confirmNewPassword?: string;
}

/* 
 * DTO: ChangePasswordDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับเปลี่ยนรหัสผ่าน
 * Input : req.body - currentPassword, newPassword, confirmNewPassword
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const changePasswordDto = {
    body: ChangePasswordDto,
} satisfies commonDto;

/* 
 * คำอธิบาย : 
 *   เปลี่ยนรหัสผ่านของผู้ใช้งาน
 * Input :
 *   - req.user.id : รหัสผู้ใช้ (number)
 *   - req.body : currentPassword, newPassword, confirmNewPassword (string)
 * Output :
 *   - 200 OK พร้อมข้อมูลผู้ใช้ที่ถูกเปลี่ยนรหัสผ่าน
 *   - 400 Bad request
 */
export const changePassword: TypedHandlerFromDto<typeof changePasswordDto> = async (req, res) => {
    try {
        const userId = Number(req?.user?.id);
        const payload = req?.body
        const result = await UserService.changePassword(userId, payload);
        return createResponse(res, 200, "Change password successfully", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};
/**
 * DTO : deleteCommunityMemberByIdDto
 * วัตถุประสงค์ : กำหนด schema ของ query สำหรับลบสมาชิกออกจากชุมชน
 * Input : req.params.userId
 * Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
 * 400 - Error message
 */
export const deleteCommunityMemberByIdDto = { 
  params: IdParamDto 
} satisfies commonDto;

/**
 * คำอธิบาย : ลบสมาชิกออกจากชุมชนตามรหัสสมาชิก เรียกใช้ Service สำหรับลบสมาชิกแบบ Soft Delete
 * Input : userId : number (รหัสสมาชิกจาก URL params)
 * Output : ข้อมูลสมาชิกที่ถูกลบแบบ Soft Delete
 */
export const deleteCommunityMemberById: TypedHandlerFromDto<
  typeof deleteCommunityMemberByIdDto
> = async (req, res) => { 
  try {
    const memberId = Number(req.params.userId);
    const deletedMember = await UserService.deleteCommunityMember(memberId);
    return createResponse(res, 200, "Deleted community member successfully", deletedMember);
  }
  catch (caughtError) {
    return createErrorResponse(res, 404, (caughtError as Error).message);
  }
  };

/**
* DTO: getMembersByAdminDto
* วัตถุประสงค์ : กำหนด schema ของ query สำหรับดึงรายชื่อสมาชิก
* Input : req.query.page, req.query.limit
* Output : 200 - ข้อมูลรายการคำขอแพ็กเกจ
* 400 - Error message
*/
export const getMemberAllByAdminDto = {
  query: PaginationDto,
} satisfies commonDto;

/**
 * คำอธิบาย : 
 *   แอดมินชุมชนดูรายชื่อสมาชิกทั้งหมดในชุมชนที่ตนดูแลได้
 * Input:
 *   - req.user : ข้อมูลผู้ใช้ที่ล็อกอิน
 *   - req.query.page, req.query.limit
 * Output:
 *   - 200 OK : คืนรายการสมาชิกพร้อม pagination
 *   - 401 Unauthorized : ถ้าไม่มีข้อมูลผู้ใช้ที่ล็อกอิน
 */
export const getMemberAllByAdmin: TypedHandlerFromDto<
  typeof getMemberAllByAdminDto
> = async (req, res) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    const { page = 1, limit = 10 } = req.query;

    const memberData = await UserService.getMemberAllByAdmin(
      req.user,
      Number(page),
      Number(limit)
    );

    return createResponse(res, 200, "Members fetched successfully", memberData);
  } catch (caughtError) {
    return createErrorResponse(res, 400, (caughtError as Error).message);
  }
};

export const softDeleteCommunityMemberByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/**
 * คำอธิบาย :
 *   Handler สำหรับแอดมินลบสมาชิกออกจากชุมชน (Soft Delete)
 *   ไม่ลบบัญชีผู้ใช้ (User)
 * Input:
 *   - req.user : ข้อมูลผู้ใช้ที่ล็อกอิน
 *   - req.params.userId : รหัสสมาชิกที่ต้องการลบ
 * Output:
 *   - 200 OK : คืนข้อมูลสมาชิกที่ถูกลบ
 *   - 401 Unauthorized : ถ้าไม่มีข้อมูลผู้ใช้ที่ล็อกอิน
 */
export const softDeleteCommunityMemberById: TypedHandlerFromDto<
  typeof softDeleteCommunityMemberByIdDto
> = async (req, res) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    const memberId = Number(req.params.userId);

    const deletedMember =
      await UserService.softDeleteCommunityMemberByAdmin(req.user.id, memberId);

    return createResponse(
      res,
      200,
      "Deleted community member successfully",
      deletedMember
    );
  } catch (caughtError) {
    return createErrorResponse(res, 404, (caughtError as Error).message);
  }
};