import {
  IsNumberString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsDateString,
} from "class-validator";
import * as UserService from "../Services/user/user-service.js";
import { Gender, UserStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { Type } from "class-transformer";
import fs from "fs";
import path from "path";
import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import {
  AccountQueryDto,
  AccountStatusQueryDto,
  IdParamDto,
} from "~/Services/user/user-dto.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { PasswordDto } from "~/Services/user/password-dto.js";

/**
 * DTO : getUserByIdDto
 * คำอธิบาย : ใช้ตรวจสอบพารามิเตอร์ userId ใน endpoint /users/:userId
 */
export const getUserByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/**
 * ฟังก์ชัน: getUserById
 * วัตถุประสงค์: ดึงข้อมูลผู้ใช้จาก userId
 * Input:
 *   - req.params.userId (string → number)
 * Output:
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

class StatusParamDto {
  @IsEnum(UserStatus)
  status?: UserStatus;
}

/**
 * DTO: getAccountsDto
 * ใช้ตรวจสอบ Query Parameter ของ endpoint /super/accounts
 */
export const getAccountsDto = {
  query: AccountQueryDto,
} satisfies commonDto;

/**
 * ฟังก์ชัน: getAccountAll
 * วัตถุประสงค์: ดึงข้อมูลผู้ใช้ทั้งหมดตามสิทธิ์ของผู้เรียก
 * Input:
 *   - req.user : ข้อมูลผู้ใช้ที่ล็อกอิน
 *   - req.query.page, req.query.limit, req.query.searchName, req.query.filterRole
 * Output:
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
    const { page = 1, limit = 10, searchName, filterRole } = req.query;
    const userData = await UserService.getAccountAll(
      req.user,
      Number(page),
      Number(limit),
      searchName,
      filterRole
    );
    return createResponse(res, 200, "Accounts fetched successfully", userData);
  } catch (caughtError) {
    return createErrorResponse(res, 400, (caughtError as Error).message);
  }
};

/**
 * DTO: getUserByStatusDto
 * ใช้ตรวจสอบ Query และ Params ของ endpoint /super/accounts/status/:status
 */
export const getUserByStatusDto = {
  params: StatusParamDto,
  query: AccountStatusQueryDto,
} satisfies commonDto;

/**
 * ฟังก์ชัน: getUserByStatus
 * วัตถุประสงค์: ดึงข้อมูลผู้ใช้ตามสถานะ (ACTIVE หรือ BLOCKED)
 * Input:
 *   - req.user : ข้อมูลผู้ใช้ที่ล็อกอิน
 *   - req.params.status : สถานะของผู้ใช้
 *   - req.query.page, req.query.limit, req.query.searchName
 * Output:
 *   - 200 OK : คืนข้อมูลผู้ใช้ตามสถานะ
 *   - 400 Bad Request : ถ้า status ไม่ถูกต้อง
 */
export const getUserByStatus: TypedHandlerFromDto<
  typeof getUserByStatusDto
> = async (req, res) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");
    const { page = 1, limit = 10, searchName } = req.query;
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
      Number(limit),
      searchName
    );
    return createResponse(res, 200, "Users fetched successfully", userData);
  } catch (caughtError) {
    return createErrorResponse(res, 500, (caughtError as Error).message);
  }
};

export const deleteAccountByIdDto = { params: IdParamDto } satisfies commonDto;
export const blockAccountByIdDto = { params: IdParamDto } satisfies commonDto;
export const unblockAccountByIdDto = { params: IdParamDto } satisfies commonDto;

/**
 * ฟังก์ชัน: deleteAccountById
 * วัตถุประสงค์: ลบบัญชีผู้ใช้ตาม ID (soft delete)
 * Input:
 *   - req.params.userId : หมายเลขผู้ใช้
 * Output:
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
 * ฟังก์ชัน: blockAccountById
 * วัตถุประสงค์: ระงับบัญชีผู้ใช้ (เปลี่ยนสถานะเป็น BLOCKED)
 * Input:
 *   - req.params.userId : หมายเลขผู้ใช้
 * Output:
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
 * ฟังก์ชัน: unblockAccountById
 * วัตถุประสงค์: ปลดระงับบัญชีผู้ใช้ (เปลี่ยนสถานะเป็น ACTIVE)
 * Input:
 *   - req.params.userId : หมายเลขผู้ใช้
 * Output:
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
 * DTO: CreateAccountDto
 * ใช้สำหรับตรวจสอบข้อมูลที่ใช้สร้างบัญชีผู้ใช้ใหม่
 */
export class CreateAccountDto {
  @IsNumber()
  @Type(() => Number)
  roleId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  memberOfCommunity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  profileImage?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  username!: string;

  @IsEmail()
  @MaxLength(65)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fname!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lname!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  phone?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  subDistrict?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  activityRole?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export const createAccountDto = {
  body: CreateAccountDto,
} satisfies commonDto;

/**
 * DTO: FileDto
 * ใช้ตรวจสอบข้อมูลไฟล์แนบในกรณีอัปโหลดรูปโปรไฟล์
 */
export class FileDto {
  @IsNumberString()
  userId?: string;
}

/**
 * ฟังก์ชัน: createAccount
 * วัตถุประสงค์: สร้างบัญชีผู้ใช้ใหม่และบันทึกรูปโปรไฟล์
 * Input:
 *   - req.body: ข้อมูลผู้ใช้
 *   - req.file: ไฟล์รูปโปรไฟล์
 * Output:
 *   - 200 OK : สร้างบัญชีสำเร็จ
 *   - 400 Bad Request : ถ้าไม่พบไฟล์แนบ
 */
export const createAccount: TypedHandlerFromDto<
  typeof createAccountDto
> = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!req.file) return res.json({ status: 400, message: "file not found" });
    const filePath = req.file.path;
    const createdUser = await UserService.createAccount(payload, filePath);
    return createResponse(res, 200, "Create User Successful", createdUser);
  } catch (caughtError) {
    return createErrorResponse(res, 404, (caughtError as Error).message);
  }
};

/**
 * ฟังก์ชัน: updateProfileImage
 * วัตถุประสงค์: อัปเดตรูปโปรไฟล์ (ลบไฟล์เก่าแล้วบันทึกใหม่)
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
 * ฟังก์ชัน: getMemberByAdmin
 * วัตถุประสงค์: แสดงข้อมูลสมาชิกที่อยู่ในชุมชนของแอดมิน
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
 * DTO : unblockAccountByIdDto
 * คำอธิบาย : ใช้ตรวจสอบพารามิเตอร์ userId password สำหรับรีเซ็ตรหัสผ่านใหม่
 */
export const resetPasswordDto = {
  params: IdParamDto,
  body: PasswordDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : forgetPassword
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
 * คำอธิบาย: Controller สำหรับเปลี่ยนรหัสผ่านของผู้ใช้งาน
 * ตรวจสอบข้อมูลจาก DTO และส่งต่อให้ UserService.changePassword ดำเนินการ
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
 * Input : currentPassword, newPassword, confirmNewPassword (string)
 * ใช้ตรวจสอบและ validate ค่าที่รับจาก body ของ request
 */
export const changePasswordDto = {
    body: ChangePasswordDto,
} satisfies commonDto;

/* 
 * Function: changePassword
 * Input : req (Request) → รับ body จาก changePasswordDto
 *         res (Response)
 * Output: Response JSON (200 เมื่อเปลี่ยนรหัสสำเร็จ / 404 เมื่อผิดพลาด)
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

export const deleteCommunityMemberByIdDto = { params: IdParamDto } satisfies commonDto;

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
