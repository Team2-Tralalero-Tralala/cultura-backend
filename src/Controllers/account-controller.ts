/*
 * Controller: Account
 * Description:
 *  - จัดการบัญชีผู้ใช้ทั้งหมด (Create / Edit / Get / Filter)
 *  - ใช้ร่วมกับ role-based access (SuperAdmin, Admin, Member)
 *  - รองรับการ validate ด้วย DTO
 */

import { IsNumberString } from "class-validator";
import { createResponse, createErrorResponse } from "../Libs/createResponse.js";
import * as AccountService from "../Services/account/account-service.js";
import {
  CreateAccountDto,
  EditAccountDto,
} from "../Services/account/account-dto.js";
import type {
  commonDto,
  TypedHandlerFromDto,
} from "../Libs/Types/TypedHandler.js";
import type { Request, Response } from "express";
import { log } from "console";
import { PaginationDto } from "~/Services/pagination-dto.js";

/** ----------------------------- DTOs ----------------------------- **/

// ใช้กับการสร้างบัญชี
export const createAccountDto = {
  body: CreateAccountDto,
} satisfies commonDto;

// ใช้กับการแก้ไขบัญชี
export class AccountIdParamDto {
  @IsNumberString()
  id?: number;
}

export const editAccountDto = {
  body: EditAccountDto,
  params: AccountIdParamDto,
} satisfies commonDto;

/** ----------------------------- Controller: Create Account ----------------------------- **/

/*
 * Controller: Account
 * คำอธิบาย : จัดการคำขอสร้างบัญชีผู้ใช้ (เฉพาะ superadmin สร้าง admin)
 * Input : ข้อมูลจาก body ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */

export const createAccount: TypedHandlerFromDto<
  typeof createAccountDto
> = async (req, res) => {
  try {
    const result = await AccountService.createAccount(
      req.body as CreateAccountDto
    );
    return createResponse(res, 201, "Account created successfully", result);
  } catch (error) {
    console.error(error);
    const message = (error as Error).message;

    // Map error messages to standard response
    switch (message) {
      case "role_not_found":
        return createErrorResponse(res, 404, "Role not found");
      case "role_not_allowed":
        return createErrorResponse(
          res,
          403,
          "You are not allowed to create this account type"
        );
      case "duplicate":
        return createErrorResponse(
          res,
          409,
          "Duplicate data (username, email, or phone)"
        );
      default:
        return createErrorResponse(res, 400, "Failed to create account");
    }
  }
};
/** ----------------------------- Controller: SuperAdmin Create Member ----------------------------- **/

/**
 * Controller: สร้างบัญชี Member (เฉพาะ SuperAdmin)
 * Role Access: SuperAdmin
 */

/** ----------------------------- Controller: Edit Account ----------------------------- **/

/**
 * Controller: Edit Account
 * Description: ใช้แก้ไขข้อมูลบัญชีผู้ใช้ตาม id
 */
export const editAccount: TypedHandlerFromDto<typeof editAccountDto> = async (
  req,
  res
) => {
  try {
    const result = await AccountService.editAccount(
      Number(req.params.id),
      req.body as EditAccountDto
    );
    return createResponse(res, 200, "Account updated successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/** ----------------------------- Controller: Get All Accounts ----------------------------- **/

/**
 * Controller: Get All Users
 * Role Access: SuperAdmin
 * Description: ดึงข้อมูลผู้ใช้ทั้งหมดแบบแบ่งหน้า (pagination)
 */
export const getAll = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query as {
      page?: string;
      limit?: string;
    };
    const data = await AccountService.getAllUser(Number(page), Number(limit));
    return createResponse(res, 200, "Get users successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/** ----------------------------- Controller: Get Members by Admin ----------------------------- **/

/**
 * Controller: Get Member by Admin
 * Role Access: Admin
 * Description: ดึงข้อมูลสมาชิกในชุมชนที่ admin นั้นดูแลอยู่
 */
export const getMemberByAdmin = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user!.id);
    const result = await AccountService.getMemberByAdmin(userId);

    return createResponse(
      res,
      200,
      "Community members retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/** ----------------------------- Controller: Get Account by ID ----------------------------- **/
export const getAccountById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await AccountService.getAccountById(id);
    return createResponse(res, 200, "Get account successfully", result);
  } catch (error) {
    const message = (error as Error).message;
    switch (message) {
      case "invalid_user_id":
        return createErrorResponse(res, 400, "Invalid user ID");
      case "user_not_found":
        return createErrorResponse(res, 404, "User not found");
      default:
        return createErrorResponse(res, 400, "Failed to get account");
    }
  }
};
/**
 * DTO สำหรับ params communityId
 */
export class CommunityIdParamDto {
  @IsNumberString()
  communityId?: string;
}
/*
 * DTO สำหรับ "ดึงข้อมูลชุมชนตามรหัส"
 */
export const getAccountInCommunityDto = {
  params: CommunityIdParamDto,
  query: PaginationDto,
} satisfies commonDto;
/*
 * ฟังก์ชัน Controller สำหรับ "ดึงข้อมูลชุมชนตามรหัส"
 * input: communityId, page, limit
 * output: account in community
 */
export const getAccountInCommunity: TypedHandlerFromDto<
  typeof getAccountInCommunityDto
> = async (req, res) => {
  try {
    const result = await AccountService.getAccountInCommunity(
      Number(req.params.communityId),
      Number(req.query.page),
      Number(req.query.limit)
    );
    return createResponse(
      res,
      200,
      "get account in community successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
