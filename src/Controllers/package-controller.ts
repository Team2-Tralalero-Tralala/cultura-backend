/*
 * คำอธิบาย : Controller
 * จัดการ Request/Response ที่เกี่ยวข้องกับ "แพ็กเกจ" (Package)
 * ทำหน้าที่เป็นตัวกลางรับข้อมูลจาก Route, ตรวจสอบสิทธิ์เบื้องต้น,
 * ส่งต่อไปยัง Service, และจัดรูปแบบ Response กลับไปยัง Client
 */

import type { Request, Response } from "express";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import type { commonDto, TypedHandlerFromDto } from "~/Libs/Types/TypedHandler.js";
import {
  IdParamDto,
  MembersQueryDto,
  PackageDto,
  PackageDuplicateParamDto,
  PackageIdParamDto,
  QueryHomestaysDto,
  QueryListHomestaysDto,
  updatePackageDto,
} from "~/Services/package/package-dto.js";
import * as PackageService from "../Services/package/package-service.js";

/*
 * DTO: createPackageDto
 * วัตถุประสงค์: ใช้สำหรับตรวจสอบความถูกต้องของข้อมูล (body)
 * เมื่อมีการสร้างแพ็กเกจใหม่
 * Input: body - (PackageDto)
 * Output: (Passed to handler)
 */
export const createPackageDto = {
  body: PackageDto,
} satisfies commonDto;

/*
 * คำอธิบาย : (SuperAdmin) Handler สำหรับสร้างแพ็กเกจใหม่
 * Input: req.body - (PackageDto), req.user.id - (UserId from auth)
 * Output: 200 - ข้อมูลแพ็กเกจที่สร้างสำเร็จ
 * 400 - Error message
 */
export async function createPackageSuperAdmin(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const result = await PackageService.createPackageBySuperAdmin(
      { ...req.body, createById: userId },
      userId
    );
    return createResponse(res, 200, "Create Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : (Admin) Handler สำหรับสร้างแพ็กเกจใหม่
 * Input: req.body - (PackageDto), req.user.id - (UserId from auth)
 * Output: 200 - ข้อมูลแพ็กเกจที่สร้างสำเร็จ
 * 400 - Error message
 */
export async function createPackageAdmin(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const result = await PackageService.createPackageByAdmin(
      { ...req.body, createById: userId },
      userId
    );
    return createResponse(res, 200, "Create Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : (Member) Handler สำหรับสร้างแพ็กเกจใหม่
 * Input: req.body - (PackageDto), req.user.id - (UserId from auth)
 * Output: 200 - ข้อมูลแพ็กเกจที่สร้างสำเร็จ
 * 400 - Error message
 */
export async function createPackageMember(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const result = await PackageService.createPackageByMember(
      { ...req.body, createById: userId },
      userId
    );
    return createResponse(res, 200, "Create Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : (SuperAdmin) Handler สำหรับดึงรายการแพ็กเกจทั้งหมด
 * Input: req.user.id, req.query.{page, limit}
 * Output: 200 - ข้อมูลแพ็กเกจพร้อม Pagination
 * 400 - Error message
 */
export async function listPackagesSuperAdmin(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await PackageService.getPackagesBySuperAdmin(userId, page, limit);
    return createResponse(res, 200, "Get Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : (Admin) Handler สำหรับดึงรายการแพ็กเกจ (ตามสิทธิ์ชุมชน)
 * Input: req.user.id, req.query.{page, limit}
 * Output: 200 - ข้อมูลแพ็กเกจพร้อม Pagination
 * 400 - Error message
 */
export async function listPackagesAdmin(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await PackageService.getPackagesByAdmin(userId, page, limit);
    return createResponse(res, 200, "Get Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : (Member) Handler สำหรับดึงรายการแพ็กเกจ (เฉพาะที่ตนเองดูแล)
 * Input: req.user.id, req.query.{page, limit}
 * Output: 200 - ข้อมูลแพ็กเกจพร้อม Pagination
 * 400 - Error message
 */
export async function listPackagesMember(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await PackageService.getPackagesByMember(userId, page, limit);
    return createResponse(res, 200, "Get Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : Controller สำหรับดึงข้อมูล Package ตาม ID
 * Input  : packageId (จาก params)
 * Output : JSON response { status, message, data }
 */
export const getPackageById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return createErrorResponse(res, 400, "Package ID ต้องเป็นตัวเลข");
    }

    const result = await PackageService.getPackageDetailById(id);
    return createResponse(res, 200, "Get Package Detail Success", result);
  } catch (error: any) {
    return createErrorResponse(res, 404, (error as Error).message);
  }
};

/*
 * คำอธิบาย : (Tourist) Handler สำหรับดึงรายการแพ็กเกจ (เฉพาะที่อนุมัติและเผยแพร่)
 * Input: req.user.id, req.query.{page, limit}
 * Output: 200 - ข้อมูลแพ็กเกจพร้อม Pagination
 * 400 - Error message
 */
export async function listPackagesTourist(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await PackageService.getPackagesByTourist(userId, page, limit);
    return createResponse(res, 200, "Get Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * DTO: editPackageDto
 * วัตถุประสงค์: ใช้สำหรับตรวจสอบความถูกต้องของข้อมูล (body)
 * เมื่อมีการแก้ไขแพ็กเกจ
 * Input: body - (updatePackageDto)
 * Output: (Passed to handler)
 */
export const editPackageDto = {
  body: updatePackageDto,
} satisfies commonDto;

/*
 * DTO: duplicatePackageHistoryDto
 * วัตถุประสงค์: ใช้สำหรับตรวจสอบความถูกต้องของ params (packageId)
 * เมื่อมีการคัดลอกแพ็กเกจจากประวัติ
 * Input: params.packageId
 * Output: (Passed to handler)
 */
export const duplicatePackageHistoryDto = {
  params: PackageDuplicateParamDto,
} satisfies commonDto;

/*
 * คำอธิบาย : (Admin) Handler สำหรับคัดลอกแพ็กเกจจากประวัติ
 * Input: req.user.id, req.params.packageId
 * Output: 201 - ข้อมูลแพ็กเกจฉบับร่างที่ถูกคัดลอก
 * 400 - Error message
 */
export const duplicatePackageHistoryAdmin: TypedHandlerFromDto<
  typeof duplicatePackageHistoryDto
> = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const packageId = Number(req.params.packageId);

    const duplicatedPackage = await PackageService.duplicatePackageFromHistory({
      packageId,
      userId,
    });

    return createResponse(res, 201, "Duplicate Package Success", duplicatedPackage);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : (SuperAdmin) Handler สำหรับแก้ไขแพ็กเกจ
 * (รองรับ multipart/form-data สำหรับอัปโหลดไฟล์)
 * Input: req.user.id, req.params.id (packageId), req.body (json or multipart)
 * Output: 200 - ข้อมูลแพ็กเกจที่อัปเดตสำเร็จ
 * 400, 401 - Error message
 */
export async function editPackageSuperAdmin(req: Request, res: Response) {
  try {
    if (!req.user) return createErrorResponse(res, 401, "Unauthorized");

    const userId = Number((req as any).user?.id);
    const packageId = Number(req.params.id);
    if (!packageId) return createErrorResponse(res, 400, "ID must be a number");

    // ① รับไฟล์ (ตาม homestay)
    const files = req.files as {
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    };

    // ② ตรวจชนิด content-type (ตาม homestay)
    const isMultipart = req.is("multipart/form-data");

    // ③ พาร์ส body (ตาม homestay)
    let parsedBody: any;
    if (isMultipart) {
      if (!req.body?.data) {
        return createErrorResponse(
          res,
          400,
          "ฟิลด์ 'data' (JSON string) ต้องถูกส่งมาใน multipart/form-data"
        );
      }
      try {
        parsedBody = JSON.parse(req.body.data);
      } catch {
        return createErrorResponse(res, 400, "ฟิลด์ 'data' ไม่ใช่ JSON ที่ถูกต้อง");
      }
    } else {
      parsedBody = req.body;
      if (!parsedBody || typeof parsedBody !== "object") {
        return createErrorResponse(res, 400, "Body ต้องเป็น JSON object");
      }
    }

    // ④ รวมไฟล์เป็น packageFile[] (เทียบเคียง homestayImage ของตัวอย่าง)
    const packageFile = [
      ...(files?.cover?.map((file) => ({ filePath: file.path, type: "COVER" })) ?? []),
      ...(files?.gallery?.map((file) => ({ filePath: file.path, type: "GALLERY" })) ?? []),
    ];

    // ⑤ อัปเดตแพ็กเกจ (service รองรับ replace เมื่อมี packageFile)
    const updatedPackage = await PackageService.editPackageBySuperAdmin(
      packageId,
      { ...parsedBody, packageFile },
      userId
    );

    // ⑥ อัปเดตแท็กให้ “เหมือน homestay 100%” (แทนที่ทั้งชุด)
    if (Array.isArray(parsedBody?.tagIds)) {
      await PackageService.updatePackageTags(
        packageId,
        parsedBody.tagIds
          .map((tagIdNumber: any) => Number(tagIdNumber))
          .filter((tagIdNumber: number) => Number.isFinite(tagIdNumber) && tagIdNumber > 0)
      );
    }

    return createResponse(res, 200, "Package Updated", updatedPackage);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
}

/*
 * คำอธิบาย : (Admin) Handler สำหรับแก้ไขแพ็กเกจ (ไม่รองรับไฟล์)
 * Input: req.user.id, req.params.id (packageId), req.body (json)
 * Output: 200 - ข้อมูลแพ็กเกจที่อัปเดตสำเร็จ
 * 400 - Error message
 */
export async function editPackageAdmin(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const packageId = Number(req.params.id);
    const result = await PackageService.editPackageByAdmin(packageId, req.body, userId);
    return createResponse(res, 200, "Package Updated", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : (Member) Handler สำหรับแก้ไขแพ็กเกจ (ไม่รองรับไฟล์)
 * Input: req.user.id, req.params.id (packageId), req.body (json)
 * Output: 200 - ข้อมูลแพ็กเกจที่อัปเดตสำเร็จ
 * 400 - Error message
 */
export async function editPackageMember(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const packageId = Number(req.params.id);
    const result = await PackageService.editPackageByMember(packageId, req.body, userId);
    return createResponse(res, 200, "Package Updated", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : (SuperAdmin) Handler สำหรับลบแพ็กเกจ (Soft Delete)
 * Input: req.user.id, req.params.id (packageId)
 * Output: 200 - ข้อมูลแพ็กเกจที่ลบสำเร็จ
 * 400 - Error message
 */
export async function deletePackageSuperAdmin(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const packageId = Number(req.params.id);
    const result = await PackageService.deletePackageBySuperAdmin(userId, packageId);
    return createResponse(res, 200, "Package Deleted", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : (Admin) Handler สำหรับลบแพ็กเกจ (Soft Delete)
 * Input: req.user.id, req.params.id (packageId)
 * Output: 200 - ข้อมูลแพ็กเกจที่ลบสำเร็จ
 * 400 - Error message
 */
export async function deletePackageAdmin(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const packageId = Number(req.params.id);
    const result = await PackageService.deletePackageByAdmin(userId, packageId);
    return createResponse(res, 200, "Package Deleted", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : (Member) Handler สำหรับลบแพ็กเกจ (Soft Delete)
 * Input: req.user.id, req.params.id (packageId)
 * Output: 200 - ข้อมูลแพ็กเกจที่ลบสำเร็จ
 * 400 - Error message
 */
export async function deletePackageMember(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const packageId = Number(req.params.id);
    const result = await PackageService.deletePackageByMember(userId, packageId);
    return createResponse(res, 200, "Package Deleted", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * คำอธิบาย : Handler สำหรับดึงข้อมูลรายละเอียดแพ็กเกจ
 * Input: req.params.id (packageId)
 * Output: 200 - ข้อมูลแพ็กเกจ
 * 404 - หากไม่พบแพ็กเกจ
 * 400 - Error message
 */
export async function getPackageDetail(req: Request, res: Response) {
  try {
    const packageId = Number(req.params.id);
    const result = await PackageService.getPackageDetailById(packageId);
    if (!result) {
      return createErrorResponse(res, 404, "Package not found");
    }
    return createResponse(res, 200, "Get Package Detail Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

/*
 * DTO: listHomestaysByPackageDto
 * วัตถุประสงค์: ใช้สำหรับตรวจสอบความถูกต้องของ params (id) และ query (q, limit)
 * เมื่อมีการดึงรายการที่พักที่เกี่ยวข้องกับแพ็กเกจ
 * Input: params.id (packageId), query.{q, limit}
 * Output: (Passed to handler)
 */
export const listHomestaysByPackageDto = {
  params: PackageIdParamDto,
  query: QueryHomestaysDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับดึงรายการที่พัก (Homestays)
 * ที่อยู่ในชุมชนเดียวกับแพ็กเกจที่ระบุ
 * Input: req.user.id, req.params.id (packageId), req.query.{q, limit}
 * Output: 200 - Array ของข้อมูลที่พัก
 * 400 - Error message
 */
export const listHomestaysByPackage: TypedHandlerFromDto<
  typeof listHomestaysByPackageDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const packageId = Number(req.params.id);
    const { q: query = "", limit = "8" } = req.query;
    const data = await PackageService.listHomestaysByPackage({
      userId,
      packageId: packageId,
      query,
      limit: Number(limit),
    });
    return createResponse(res, 200, "fetch homestays successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * DTO: getCommunityMembersDto
 * วัตถุประสงค์: ใช้สำหรับตรวจสอบความถูกต้องของ params (communityId) และ query (q, limit)
 * เมื่อมีการดึงรายชื่อสมาชิกในชุมชน
 * Input: params.communityId, query.{q, limit}
 * Output: (Passed to handler)
 */
export const getCommunityMembersDto = {
  params: IdParamDto, // Note: DTO นี้อาจใช้ 'id' แต่ route ใช้ 'communityId'
  query: MembersQueryDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับดึงรายชื่อสมาชิก (Members) และผู้ดูแล (Admin)
 * ของชุมชนที่ระบุ
 * Input: req.params.communityId, req.query.{q, limit}
 * Output: 200 - Array ของข้อมูลผู้ใช้ (Admin + Members)
 * 400 - Error message
 */
export const getCommunityMembers: TypedHandlerFromDto<
  typeof getCommunityMembersDto
> = async (req, res) => {
  try {
    // หมายเหตุ: DTO ใช้ 'id' แต่ route จริงอาจใช้ 'communityId'
    // เราจะอ่านจาก 'communityId' ตามที่ logic เดิมทำไว้
    const communityId = Number((req.params as any).communityId);
    const query = (req.query.q as string) ?? "";
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const result = await PackageService.getCommunityMembersAndAdmin(
      communityId,
      query,
      limit
    );
    return createResponse(res, 200, "Community people fetched", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * DTO: listCommunityHomestaysDto
 * วัตถุประสงค์: ใช้สำหรับตรวจสอบความถูกต้องของ query (q, limit)
 * เมื่อมีการดึงรายการที่พักในชุมชนของผู้ใช้
 * Input: query.{q, limit}
 * Output: (Passed to handler)
 */
export const listCommunityHomestaysDto = {
  query: QueryListHomestaysDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับดึงรายการที่พัก (Homestays)
 * ที่อยู่ในชุมชนเดียวกับผู้ใช้ (Admin/Member)
 * Input: req.user.id, req.query.{q, limit}
 * Output: 200 - Array ของข้อมูลที่พัก
 * 400 - Error message
 */
export const listCommunityHomestays: TypedHandlerFromDto<
  typeof listCommunityHomestaysDto
> = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const { q: query = "", limit = 8 } = req.query;

    const data = await PackageService.listCommunityHomestays({
      userId,
      query,
      limit: Number(limit),
    });

    return createResponse(res, 200, "fetch homestays successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * คำอธิบาย : (SuperAdmin) Handler สำหรับดึงรายการที่พัก (Homestays)
 * ทั้งหมดในระบบ
 * Input: req.query.{q, limit}
 * Output: 200 - Array ของข้อมูลที่พัก
 * 400 - Error message
 */
export const listAllHomestaysSuperAdmin: TypedHandlerFromDto<
  typeof listCommunityHomestaysDto // ใช้ DTO เดียวกัน (q, limit)
> = async (req, res) => {
  try {
    // Super Admin ไม่ต้องใช้ userId
    const { q: query = "", limit = 8 } = req.query;

    const data = await PackageService.listAllHomestaysSuperAdmin({
      query,
      limit: Number(limit),
    });

    return createResponse(res, 200, "Fetch all homestays successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * ฟังก์ชัน : getAllFeedbacks
 * คำอธิบาย : (Admin/Member) Handler สำหรับดึงรายการ Feedback ทั้งหมดในระบบ
 * เงื่อนไข :
 *   - ตรวจสอบสิทธิ์ผู้ใช้จาก req.user (ต้องล็อกอินก่อน)
 *   - ใช้ userId จาก token เพื่อกรองข้อมูล Feedback ของผู้ใช้
 * การทำงาน :
 *   1. ตรวจสอบว่า req.user มีค่าหรือไม่ → ถ้าไม่มีให้ตอบกลับ 401 Unauthorized
 *   2. เรียกใช้ Service: PackageService.getAllFeedbacks(userId)
 *   3. ส่งผลลัพธ์กลับพร้อมสถานะ 200 และข้อความ “Get FeedBacks Successfully”
 * การตอบกลับ :
 *   - 200 : ดึง Feedback ทั้งหมดสำเร็จ
 *   - 401 : ไม่มีสิทธิ์เข้าถึง (ไม่ได้ล็อกอิน)
 *   - 404 : เกิดข้อผิดพลาดขณะดึงข้อมูล
 */
export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "Unauthorized");
    }
    const userId = req.user.id;
    const result = await PackageService.getAllFeedbacks(userId);
    return createResponse(res, 200, "Get FeedBacks Successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 404, (error as Error).message);
  }
};

/*
 * คำอธิบาย : (Admin) Handler สำหรับดึงรายละเอียดประวัติแพ็กเกจ
 * Method : GET
 * Endpoint : /api/admin/package/history/:packageId
 * Input  : req.params.packageId (หมายเลขไอดีของแพ็กเกจ)
 * Output : 200 - รายละเอียดแพ็กเกจพร้อมข้อมูลประวัติการใช้งาน Homestay และ Booking
 *           404 - หากไม่พบแพ็กเกจ
 *           400 - หากเกิดข้อผิดพลาดอื่น
 * การทำงาน :
 *   1. อ่านค่า packageId จากพารามิเตอร์ URL
 *   2. เรียกใช้ Service ชั้น package-service เพื่อดึงข้อมูลแพ็กเกจและประวัติทั้งหมด
 *   3. หากไม่พบข้อมูลให้ส่ง Response 404
 *   4. หากพบให้จัดรูปแบบ Response และส่งกลับให้ Client
 */

export async function getPackageHistoryDetailAdmin(req: Request, res: Response) {
  try {
    const packageId = Number(req.params.packageId);
    if (!packageId) return createErrorResponse(res, 400, "Invalid packageId");

    const result = await PackageService.getPackageHistoryDetailById(packageId);
    if (!result) return createErrorResponse(res, 404, "Package history not found");

    return createResponse(res, 200, "Get Package History Detail Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}
/*
 * คำอธิบาย : (Admin) Handler สำหรับดึงรายการ "ประวัติแพ็กเกจที่สิ้นสุดแล้ว"
 * Input: req.user.id, req.query.{page, limit}
 * Output: 200 - ข้อมูลแพ็กเกจที่สิ้นสุดแล้ว (พร้อม Pagination)
 * 400 - Error message
 */
export async function getHistoriesPackageAdmin(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await PackageService.getHistoriesPackageByAdmin(userId, page, limit);

    return createResponse(res, 200, "Get History Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }

  
}

export const getDraftPackagesDto = {} satisfies commonDto;

export const getDraftPackages: TypedHandlerFromDto<typeof getDraftPackagesDto> = async (
  req,
  res
) => {
  try {
    const myId = req.user?.id;
    const result = await PackageService.getDraftPackages(Number(myId));
    return createResponse(
      res,
      200,
      "Fetched draft package successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
