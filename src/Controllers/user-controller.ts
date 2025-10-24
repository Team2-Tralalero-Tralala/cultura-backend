import { IsNumberString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, IsNotEmpty, IsEmail, IsDateString } from "class-validator";

import * as UserService from "../Services/user/user-service.js";
import { Gender, UserStatus } from "@prisma/client";

import { PaginationDto } from "~/Libs/Types/pagination-dto.js";

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
import { Type } from "class-transformer";


/*
 * DTO : getUserByIdDto
 * คำอธิบาย : ใช้ตรวจสอบพารามิเตอร์ userId ใน endpoint /users/:userId
 */

export const getUserByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getUserById
 * คำอธิบาย : Handler สำหรับดึงข้อมูลผู้ใช้จาก userId
 * Input :
 *   - req.params.userId : รหัสผู้ใช้ (string, จะถูกแปลงเป็น number)
 * Output :
 *   - 200 OK พร้อมข้อมูลผู้ใช้
 *   - 404 Not Found ถ้าไม่พบผู้ใช้
 */

export const getUserById: TypedHandlerFromDto<typeof getUserByIdDto> = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const result = await UserService.getUserById(userId);
        return createResponse(res, 200, "User fetched successfully", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

/* ==================== DTO ==================== */
class StatusParamDto {
  @IsEnum(UserStatus)
  status?: UserStatus;
}

/* ==================== ดึงผู้ใช้ทั้งหมด ==================== */
export const getAccountsDto = {
  query: AccountQueryDto,
} satisfies commonDto;

export const getAccountAll: TypedHandlerFromDto<typeof getAccountsDto> = async (req, res) => {
  try {
    if (!req.user) return createErrorResponse(res, 401, "User not authenticated");

    const { page = 1, limit = 10, searchName, filterRole } = req.query;

    const result = await UserService.getAccountAll(
      req.user,
      Number(page),
      Number(limit),
      searchName,
      filterRole
    );

    return createResponse(res, 200, "Accounts fetched successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/* ==================== ดึงผู้ใช้ตามสถานะ ==================== */
export const getUserByStatusDto = {
  params: StatusParamDto,
  query: AccountStatusQueryDto,
} satisfies commonDto;

export const getUserByStatus: TypedHandlerFromDto<typeof getUserByStatusDto> = async (req, res) => {
  try {
    if (!req.user) return createErrorResponse(res, 401, "User not authenticated");

    const { page = 1, limit = 10, searchName } = req.query;
    const status = req.params.status;

    if (!status || !Object.values(UserStatus).includes(status as UserStatus)) {
      return createErrorResponse(res, 400, "Invalid status. Must be ACTIVE or BLOCKED");
    }

    const result = await UserService.getUserByStatus(
      req.user,
      status as UserStatus,
      Number(page),
      Number(limit),
      searchName
    );

    return createResponse(res, 200, "Users fetched successfully", result);
  } catch (error) {
    return createErrorResponse(res, 500, (error as Error).message);
  }
};

/* ==================== CRUD พื้นฐาน ==================== */
export const deleteAccountByIdDto = { params: IdParamDto } satisfies commonDto;
export const blockAccountByIdDto = { params: IdParamDto } satisfies commonDto;
export const unblockAccountByIdDto = { params: IdParamDto } satisfies commonDto;


// ลบบัญชีผู้ใช้
export const deleteAccountById: TypedHandlerFromDto<typeof deleteAccountByIdDto> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const result = await UserService.deleteAccount(userId);
    return createResponse(res, 200, "Deleted user successfully", result);
  } catch (error) {
    return createErrorResponse(res, 404, (error as Error).message);
  }
};

// บล็อกบัญชีผู้ใช้
export const blockAccountById: TypedHandlerFromDto<typeof blockAccountByIdDto> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const result = await UserService.blockAccount(userId);
    return createResponse(res, 200, "User blocked successfully", result);
  } catch (error) {
    return createErrorResponse(res, 404, (error as Error).message);
  }
};

// ปลดบล็อกบัญชีผู้ใช้
export const unblockAccountById: TypedHandlerFromDto<typeof unblockAccountByIdDto> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const result = await UserService.unblockAccount(userId);
    return createResponse(res, 200, "User unblocked successfully", result);
  } catch (error) {
    return createErrorResponse(res, 404, (error as Error).message);
  }
};

/* 
 * คำอธิบาย: Controller และ DTO สำหรับสร้างบัญชีผู้ใช้ใหม่ (Create Account)
 * ตรวจสอบข้อมูลผู้ใช้ที่ส่งมาผ่าน body และไฟล์รูปโปรไฟล์จาก Multer
 * จากนั้นเรียก UserService.createAccount เพื่อบันทึกข้อมูลลงฐานข้อมูล
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

  /* 
 * DTO: CreateAccountDto
 * ใช้สำหรับตรวจสอบ (Validate) ข้อมูลการสมัครผู้ใช้ใหม่ เช่น
 * roleId, username, email, password, ข้อมูลส่วนตัว และที่อยู่
 * โดยใช้ class-validator และ class-transformer
 */
  export const createAccountDto = {
    body: CreateAccountDto,
  } satisfies commonDto;

/* 
 * DTO: fileDto
 * ใช้สำหรับตรวจสอบข้อมูลไฟล์แนบ (กรณีส่ง userId มาพร้อมไฟล์)
 */
export class fileDto {
    @IsNumberString()
    userId?: string;
}

/* 
 * Function: createAccount
 * Input : req (Request) → body: CreateAccountDto + file: รูปโปรไฟล์
 *         res (Response)
 * Output: Response JSON ที่มีข้อมูลผู้ใช้ที่สร้างใหม่
 * Process: 
 *   1. ตรวจสอบว่ามีไฟล์แนบหรือไม่
 *   2. ดึง path ของไฟล์จาก req.file.path
 *   3. เรียกใช้ UserService.createAccount เพื่อบันทึกข้อมูล
 *   4. ส่ง Response กลับพร้อมข้อความ "Create User Successful"
 */
export const createAccount: TypedHandlerFromDto<typeof createAccountDto> = async (req:any, res:any) => {
    try {
        const payload = req.body;
        if (!req.file) {
            return res.json({status: 400, message: 'file not found'})
        }
        const pathImage = req.file.path
        const result = await UserService.createAccount(payload, pathImage)
        return createResponse(res, 200, "Create User Successful", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
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