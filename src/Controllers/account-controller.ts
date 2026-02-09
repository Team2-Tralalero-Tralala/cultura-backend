import { IsNumberString } from "class-validator";
import { createResponse, createErrorResponse } from "../Libs/createResponse.js";
import * as AccountService from "../Services/account/account-service.js";
import * as AccountDto from "../Services/account/account-dto.js";
import type {
  commonDto,
  TypedHandlerFromDto,
} from "../Libs/Types/TypedHandler.js";
import type { Request, Response } from "express";
import { PaginationDto } from "~/Services/pagination-dto.js";

/**
 * DTO: createAccountDto
 * วัตถุประสงค์: กำหนด schema สำหรับ createAccount
 * Input : ข้อมูลจาก body ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
export const createAccountDto = {
  body: AccountDto.CreateAccountDto,
} satisfies commonDto;

/**
 * DTO: AccountIdParamDto
 * วัตถุประสงค์: กำหนด schema สำหรับ AccountIdParam
 * Input : ข้อมูลจาก params ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
export class AccountIdParamDto {
  @IsNumberString()
  id?: number;
}
/**
 * DTO: editAccountDto
 * วัตถุประสงค์: กำหนด schema สำหรับ editAccount
 * Input : ข้อมูลจาก body และ params ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
export const editAccountDto = {
  body: AccountDto.EditAccountDto,
  params: AccountIdParamDto,
} satisfies commonDto;


/*
 * คำอธิบาย : จัดการคำขอสร้างบัญชีผู้ใช้ (เฉพาะ superadmin สร้าง admin)
 * Input : ข้อมูลจาก body ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */

export const createAccount: TypedHandlerFromDto<
  typeof createAccountDto
> = async (req, res) => {
  try {
    const result = await AccountService.createAccount(
      req.body as AccountDto.CreateAccountDto
    );
    return createResponse(res, 201, "Account created successfully", result);
  } catch (error) {
    console.error(error);
    const message = (error as Error).message;

    // Map error messages to standard response
    switch (message) {
      case "role_not_found":
        return createErrorResponse(res, 404, "ไม่พบบทบาท");
      case "role_not_allowed":
        return createErrorResponse(
          res,
          403,
          "ไม่สามารถสร้างบัญชีประเภทนี้ได้"
        );
      case "duplicate":
        return createErrorResponse(
          res,
          409,
          "มีข้อมูลซ้ำ (username, email, หรือ phone)"
        );
      default:
        return createErrorResponse(res, 400, "ไม่สามารถสร้างบัญชีได้");
    }
  }
};


/**
 * คำอธิบาย : จัดการคำขอแก้ไขข้อมูลบัญชีผู้ใช้ตาม id
 * Input : ข้อมูลจาก body และ params ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
export const editAccount: TypedHandlerFromDto<typeof editAccountDto> = async (
  req,
  res
) => {
  try {
    const result = await AccountService.editAccount(
      Number(req.params.id),
      req.body as AccountDto.EditAccountDto
    );
    return createResponse(res, 200, "Account updated successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};


/**
 * คำอธิบาย : จัดการคำขอแสดงข้อมูลผู้ใช้ทั้งหมดแบบแบ่งหน้า (pagination)
 * Input : ข้อมูลจาก query ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
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

/**
 * คำอธิบาย : จัดการคำขอแสดงข้อมูลสมาชิกในชุมชนที่ admin นั้นดูแลอยู่
 * Input : ข้อมูลจาก query ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
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
/**
 * คำอธิบาย : จัดการคำขอแสดงข้อมูลบัญชีผู้ใช้ตาม id
 * Input : ข้อมูลจาก params ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
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
 * DTO: CommunityIdParamDto
 * วัตถุประสงค์: กำหนด schema สำหรับ CommunityIdParam
 * Input : ข้อมูลจาก params ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
export class CommunityIdParamDto {
  @IsNumberString()
  communityId?: string;
}
/*
 * DTO: getAccountInCommunityDto
 * วัตถุประสงค์: กำหนด schema สำหรับ getAccountInCommunity
 * Input : ข้อมูลจาก params และ query ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
export const getAccountInCommunityDto = {
  params: CommunityIdParamDto,
  query: PaginationDto,
} satisfies commonDto;
/*
 * คำอธิบาย : จัดการคำขอแสดงข้อมูลบัญชีผู้ใช้ตาม id
 * Input : ข้อมูลจาก params ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
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
      "ดึงข้อมูลสมาชิกในชุมชนสำเร็จ",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};


/*
 * คำอธิบาย : จัดการคำขอสร้างบัญชีผู้ใช้ใหม่
 * Input : ข้อมูลจาก body ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
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
    } as AccountDto.CreateAccountDto;

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

/*
 * คำอธิบาย : จัดการคำขอแก้ไขข้อมูลสมาชิกในชุมชนของตัวเอง
 * Input : ข้อมูลจาก body ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
export const editMemberByAdmin: TypedHandlerFromDto<
  typeof editAccountDto
> = async (req, res) => {
  try {
    const adminId = Number(req.user!.id);
    const targetUserId = Number(req.params.id);
    const body = req.body as AccountDto.EditAccountDto;

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
/**
 * DTO: ProfileIdParamDto
 * วัตถุประสงค์: กำหนด schema สำหรับ ProfileIdParam
 * Input : ข้อมูลจาก params ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
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
  body: AccountDto.EditAccountDto, 
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
 * Input :
 *   - ไม่มี
 * Output :
 *   - ข้อมูลโปรไฟล์ของผู้ใช้งาน (จาก token)
 */
export const getMeDto = {} satisfies commonDto;

/**
 * คำอธิบาย :
 *   ดึงข้อมูลโปรไฟล์ของผู้ใช้งานที่กำลังล็อกอินอยู่
 * Input :
 *   - req.user.id : รหัสผู้ใช้งานจาก token
 * Output :
 *   - Response 200 : ข้อมูลโปรไฟล์ของผู้ใช้งาน
 *   - Response 400 : กรณีเกิดข้อผิดพลาด
 */
export const getMe: TypedHandlerFromDto<typeof getMeDto> = async (req, res) => {
  try {
    const result = await AccountService.getMe(Number(req.user?.id));
    return createResponse(res, 200, "ดึงข้อมูลโปรไฟล์สำเร็จ", result);
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
  body: AccountDto.EditAccountDto,
} satisfies commonDto;

/**
 * คำอธิบาย : จัดการคำขอแก้ไขข้อมูลโปรไฟล์ของผู้ใช้งานที่มีบทบาทเป็น Tourist
 * Input : ข้อมูลจาก body ที่ผ่าน DTO ตรวจสอบแล้ว
 * Output : Response มาตรฐาน createResponse / createErrorResponse
 */
export const editProfileTourist = async (req: Request, res: Response) => {
  try {
    const body = req.body as AccountDto.EditAccountDto;

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
