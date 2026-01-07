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

/** ----------------------------- Controller: Admin Create Member ----------------------------- **/

/*
 * Controller: Admin Create Member
 * คำอธิบาย : Admin สร้างสมาชิกใหม่
 */
export const createMemberByAdmin: TypedHandlerFromDto<
  typeof createAccountDto
> = async (req, res) => {
  try {
    const adminId = Number(req.user!.id);

    const communityId = await AccountService.getCommunityIdByAdminId(adminId);

    const payload = {
      ...req.body,
      memberOfCommunity: communityId,
      communityRole: req.body.communityRole || "General Member",
    } as CreateAccountDto;

    const result = await AccountService.createAccount(payload);

    return createResponse(res, 201, "สร้างบัญชีสมาชิกสำเร็จ", result);
  } catch (error) {
    console.error(error);
    const message = (error as Error).message;
    if (message === "community_not_found_for_admin") {
      return createErrorResponse(
        res,
        403,
        "คุณไม่ได้เป็นผู้ดูแลชุมชนใดๆ ไม่สามารถสร้างสมาชิกได้"
      );
    }
    return createErrorResponse(res, 400, message);
  }
};
/** ----------------------------- Controller: Admin Edit Member ----------------------------- **/

/*
 * Controller: Admin Edit Member
 * คำอธิบาย : Admin แก้ไขข้อมูลสมาชิกในชุมชนของตัวเอง
 * Access: Admin
 */
export const editMemberByAdmin: TypedHandlerFromDto<
  typeof editAccountDto
> = async (req, res) => {
  try {
    const adminId = Number(req.user!.id);
    const targetUserId = Number(req.params.id);
    const body = req.body as EditAccountDto;

    const adminCommunityId = await AccountService.getCommunityIdByAdminId(
      adminId
    );

    const targetUser = await AccountService.getAccountById(targetUserId);

    if (targetUser.memberOfCommunity !== adminCommunityId) {
      return createErrorResponse(
        res,
        403,
        "คุณไม่มีสิทธิ์แก้ไขข้อมูลสมาชิกรายนี้ (เนื่องจากสมาชิกไม่ได้อยู่ในชุมชนของคุณ)"
      );
    }

    const result = await AccountService.editAccount(targetUserId, body);

    return createResponse(res, 200, "แก้ไขข้อมูลสมาชิกสำเร็จ", result);
  } catch (error) {
    const message = (error as Error).message;
    if (message === "community_not_found_for_admin") {
      return createErrorResponse(res, 403, "คุณไม่ได้เป็นผู้ดูแลชุมชนใดๆ");
    }
    if (message === "user_not_found") {
      return createErrorResponse(res, 404, "ไม่พบข้อมูลสมาชิกนี้ในระบบ");
    }
    return createErrorResponse(res, 400, message);
  }
};
export class ProfileIdParamDto {
  @IsNumberString()
  accountId?: string;
}

/**
 * DTO: editProfileDto
 * วัตถุประสงค์ :
 *   ใช้สำหรับตรวจสอบความถูกต้องของข้อมูลที่ผู้ใช้งานส่งเข้ามา
 *   สำหรับการแก้ไขข้อมูลโปรไฟล์ของผู้ใช้งานเอง
 *
 * Input :
 *   - body : ข้อมูลสมาชิกที่ต้องการแก้ไข (อ้างอิง EditAccountDto)
 *
 * Output :
 *   - หากข้อมูลถูกต้อง ระบบจะส่งต่อไปยัง controller เพื่อประมวลผล
 */
export const editProfileDto = {
  body: EditAccountDto, 
} satisfies commonDto;

/*
 * คำอธิบาย :
 * คอนโทรลเลอร์สำหรับแก้ไขข้อมูลส่วนตัวของผู้ใช้งานที่ล็อกอินอยู่
 * รองรับการรับข้อมูลทั้งแบบ JSON ปกติ และแบบ Multipart (FormData) สำหรับการอัปโหลดรูปภาพ
 *
 * Input :
 * - req.user.id : รหัสผู้ใช้งานที่ล็อกอิน (ดึงจาก Token)
 * - req.file    : ไฟล์รูปภาพโปรไฟล์ใหม่ (Optional, รับจาก Multer)
 * - req.body.data : ข้อมูลโปรไฟล์แบบ JSON String (กรณีส่งแบบ Multipart)
 * - req.body    : ข้อมูลโปรไฟล์แบบ JSON Object (กรณีไม่มีการอัปโหลดไฟล์)
 *
 * Output :
 * - Response 200 : แก้ไขข้อมูลสมาชิกสำเร็จ พร้อมส่งข้อมูลล่าสุดกลับไป
 * - Response 400 : กรณีเกิดข้อผิดพลาด เช่น JSON Format ไม่ถูกต้อง
 */
export const editProfile = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const file = req.file; // รับไฟล์จาก Multer

    let bodyData: any = {};

    if (req.body.data) {
      try {
        bodyData = JSON.parse(req.body.data);
      } catch (error) {
        return createErrorResponse(res, 400, "รูปแบบข้อมูล JSON ไม่ถูกต้อง");
      }
    } else {
      bodyData = req.body;
    }
    if (file) {
      const imagePath = `/uploads/${file.filename}`;
      bodyData.profileImage = imagePath;
    }
    const result = await AccountService.editProfile(
      userId,
      bodyData // ส่ง Object ที่รวมข้อมูล + Path รูป ไปให้ Service
    );
    return createResponse(res, 200, "แก้ไขข้อมูลสำเร็จ", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/**
 * DTO: getMeDto
 * วัตถุประสงค์ :
 *   ใช้สำหรับดึงข้อมูลโปรไฟล์ของผู้ใช้งานที่กำลังล็อกอินอยู่
 *   โดยไม่ต้องรับข้อมูลเพิ่มเติมจาก client
 *
 * Input :
 *   - ไม่มี
 *
 * Output :
 *   - ข้อมูลโปรไฟล์ของผู้ใช้งาน (จาก token)
 */
export const getMeDto = {} satisfies commonDto;

/**
 * ฟังก์ชัน : getMe
 * คำอธิบาย :
 *   Controller สำหรับดึงข้อมูลโปรไฟล์ของผู้ใช้งานที่กำลังล็อกอินอยู่
 *
 * Input :
 *   - req.user.id : รหัสผู้ใช้งานจาก token
 *
 * Output :
 *   - Response 200 : ข้อมูลโปรไฟล์ของผู้ใช้งาน
 *   - Response 400 : กรณีเกิดข้อผิดพลาด
 */
export const getMe: TypedHandlerFromDto<typeof getMeDto> = async (req, res) => {
  try {
    const result = await AccountService.getMe(Number(req.user?.id));
    return createResponse(res, 200, "get my profile data successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/**
 * DTO : editProfileTouristDto
 * วัตถุประสงค์ : ใช้สำหรับตรวจสอบความถูกต้องของข้อมูลที่ผู้ใช้งานส่งเข้ามา
 * สำหรับการแก้ไขข้อมูลโปรไฟล์ของผู้ใช้งานที่มีบทบาทเป็น Tourist
 * Input : ข้อมูลของ Tourist ที่ต้องการแก้ไข (อ้างอิง EditAccountDto)
 * Output : หากข้อมูลอยู่ในรูปแบบที่ถูกต้อง ระบบจะอนุญาตให้ดำเนินการแก้ไขโปรไฟล์ได้
 * หากข้อมูลไม่ถูกต้อง ระบบจะเเจ้งข้อผิดพลาดกลับไปยังผู้ใช้งานทันที
 */
export const editProfileTouristDto = {
  body: EditAccountDto,
} satisfies commonDto;

/**
 * Controller : editProfileTourist
 * Role Access : Tourist
 * Description : สำหรับแก้ไขข้อมูลโปรไฟล์ของผู้ใช้งานที่มีบทบาทเป็น Tourist
 * Input : รหัสผู้ใช้งานจาก token (req.user.id), ข้อมูลโปรไฟล์ที่ต้องการแก้ไข (req.body)
 * Output : แก้ไขข้อมูลสำเร็จ (Response 200), กรณีเกิดข้อผิดพลาด(Response 400)
 */
export const editProfileTourist = async (req: Request, res: Response) => {
  try {
    const body = req.body as EditAccountDto;

    if (req.file) {
      body.profileImage = req.file.path.replace(/\\/g, "/");
    } else {
      delete body.profileImage;
    }

    const result = await AccountService.editProfileTourist(
      Number(req.user?.id),
      body
    );

    return createResponse(res, 200, "แก้ไขข้อมูลสำเร็จ", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};
