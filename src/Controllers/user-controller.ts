import { IsNumberString, IsEnum,  IsNumber, 
    IsOptional, 
    IsString, 
    IsNotEmpty, 
    MaxLength, 
    IsEmail, 
    IsDateString  } from "class-validator";

import * as UserService from "../Services/user-service.js";
import { Gender, UserStatus } from "@prisma/client";

import { PaginationDto } from "~/Libs/Types/pagination-dto.js";

import type {
    commonDto,
    TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { Type } from "class-transformer";

/*
 * DTO : IdParamDto
 * คำอธิบาย : Schema สำหรับตรวจสอบพารามิเตอร์ userId
 * Input : params.userId (string) - ค่าที่ต้องเป็นตัวเลข
 * Output : แปลงค่าเป็น number ก่อนส่งต่อให้ service
 */

export class IdParamDto {
    @IsNumberString()
    userId?: string;
}

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

/*
 * DTO : StatusParamDto
 * คำอธิบาย : ตรวจสอบพารามิเตอร์ status ของผู้ใช้
 * Input :
 *   - status (string) : สถานะผู้ใช้ ต้องเป็น ACTIVE หรือ BLOCKED
 * Output :
 *   - validated status (UserStatus) หากค่าถูกต้อง
 *   - Error หากค่าไม่อยู่ใน ACTIVE / BLOCKED
 */

class StatusParamDto {
  @IsEnum(UserStatus)
  status?: UserStatus;
}

/*
 * DTO : getUserByStatusDto
 * คำอธิบาย : ตรวจสอบพารามิเตอร์สำหรับ endpoint ดึงผู้ใช้ตามสถานะ พร้อมรองรับ pagination
 * Input :
 *   - params.status : สถานะผู้ใช้ (ACTIVE, BLOCKED)
 *   - query.page : หน้าที่ต้องการ (default = 1)
 *   - query.limit : จำนวนผู้ใช้ต่อหน้า (default = 10)
 * Output :
 *   - validated params และ query เพื่อส่งต่อให้ handler
 */

export const getUserByStatusDto = {
  params: StatusParamDto,
  query: PaginationDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : getUserByStatus
 * คำอธิบาย : Handler สำหรับดึงผู้ใช้ตามสถานะ พร้อม pagination
 * Input :
 *   - req.params.status : สถานะผู้ใช้ (ACTIVE หรือ BLOCKED)
 *   - req.query.page, req.query.limit : ควบคุมการแบ่งหน้า
 * Output :
 *   - 200 OK พร้อมรายการผู้ใช้ + ข้อมูล pagination
 *   - 400 Bad Request ถ้า status ไม่ถูกต้อง
 *   - 500 Internal Server Error ถ้ามี error อื่น
 */

export const getUserByStatus: TypedHandlerFromDto<typeof getUserByStatusDto> = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const status = req.params.status;

        if (!status || !Object.values(UserStatus).includes(status as UserStatus)) {
            return createErrorResponse(res, 400, "Invalid status. Must be ACTIVE or BLOCKED");
        }

        const result = await UserService.getUserByStatus(
            status as UserStatus,
            Number(page),
            Number(limit)
        );

        return createResponse(res, 200, "Users fetched successfully", result);
    } catch (error) {
        return createErrorResponse(res, 500, (error as Error).message);
    }
};

/*
 * DTO : deleteAccountByIdDto
 * คำอธิบาย : ใช้ตรวจสอบพารามิเตอร์ userId สำหรับลบผู้ใช้
 */

export const deleteAccountByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : deleteAccountById
 * คำอธิบาย : Handler สำหรับลบผู้ใช้ตาม userId
 * Input :
 *   - req.params.userId : รหัสผู้ใช้ (string → number)
 * Output :
 *   - 200 OK พร้อมข้อมูลผู้ใช้ที่ถูกลบ
 *   - 404 Not Found ถ้าไม่พบผู้ใช้
 */

export const deleteAccountById: TypedHandlerFromDto<typeof deleteAccountByIdDto> = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const result = await UserService.deleteAccount(userId);
        return createResponse(res, 200, "Deleted user successfully", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

/*
 * DTO : blockAccountByIdDto
 * คำอธิบาย : ใช้ตรวจสอบพารามิเตอร์ userId สำหรับบล็อคผู้ใช้
 */

export const blockAccountByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : blockAccountById
 * คำอธิบาย : Handler สำหรับบล็อคผู้ใช้ (เปลี่ยนสถานะเป็น BLOCKED)
 * Input :
 *   - req.params.userId : รหัสผู้ใช้ (string → number)
 * Output :
 *   - 200 OK พร้อมข้อมูลผู้ใช้ที่ถูกบล็อค
 *   - 404 Not Found ถ้าไม่พบผู้ใช้
 */


export const blockAccountById: TypedHandlerFromDto<typeof blockAccountByIdDto> = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const result = await UserService.blockAccount(userId);
        return createResponse(res, 200, "User blocked successfully", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

/*
 * DTO : unblockAccountByIdDto
 * คำอธิบาย : ใช้ตรวจสอบพารามิเตอร์ userId สำหรับปลดบล็อคผู้ใช้
 */

export const unblockAccountByIdDto = {
  params: IdParamDto,
} satisfies commonDto;


/*
 * ฟังก์ชัน : unblockAccountById
 * คำอธิบาย : Handler สำหรับปลดบล็อคผู้ใช้ (เปลี่ยนสถานะเป็น ACTIVE)
 * Input :
 *   - req.params.userId : รหัสผู้ใช้ (string → number)
 * Output :
 *   - 200 OK พร้อมข้อมูลผู้ใช้ที่ถูกปลดบล็อค
 *   - 404 Not Found ถ้าไม่พบผู้ใช้
 */

export const unblockAccountById: TypedHandlerFromDto<typeof unblockAccountByIdDto> = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const result = await UserService.unblockAccount(userId);
        return createResponse(res, 200, "User unblock successfully", result);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

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

export class fileDto {
    @IsNumberString()
    userId?: string;
}

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
