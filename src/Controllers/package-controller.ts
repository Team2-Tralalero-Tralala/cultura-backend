// Controllers/package-controller.ts
import type { Request, Response } from "express";
import * as PackageService from "../Services/package/package-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import type { commonDto, TypedHandlerFromDto } from "~/Libs/Types/TypedHandler.js";
import { IdParamDto, MembersQueryDto, PackageDto, PackageIdParamDto, QueryHomestaysDto, QueryListHomestaysDto, updatePackageDto } from "~/Services/package/package-dto.js";

export const createPackageDto = {
  body: PackageDto,
} satisfies commonDto;

export async function createPackageSuperAdmin(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const result = await PackageService.createPackageBySuperAdmin(
      { ...req.body, createById: uid },
      uid
    );
    return createResponse(res, 200, "Create Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function createPackageAdmin(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const result = await PackageService.createPackageByAdmin(
      { ...req.body, createById: uid },
      uid
    );
    return createResponse(res, 200, "Create Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function createPackageMember(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const result = await PackageService.createPackageByMember(
      { ...req.body, createById: uid },
      uid
    );
    return createResponse(res, 200, "Create Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function listPackagesSuperAdmin(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await PackageService.getPackagesBySuperAdmin(uid, page, limit);
    return createResponse(res, 200, "Get Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function listPackagesAdmin(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await PackageService.getPackagesByAdmin(uid, page, limit);
    return createResponse(res, 200, "Get Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function listPackagesMember(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await PackageService.getPackagesByMember(uid, page, limit);
    return createResponse(res, 200, "Get Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function listPackagesTourist(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await PackageService.getPackagesByTourist(uid, page, limit);
    return createResponse(res, 200, "Get Packages Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}


export const editPackageDto = {
  body: updatePackageDto,
} satisfies commonDto;

export async function editPackageSuperAdmin(req: Request, res: Response) {
  try {
    if (!req.user) return createErrorResponse(res, 401, "Unauthorized");

    const uid = Number((req as any).user?.id);
    const id = Number(req.params.id);
    if (!id) return createErrorResponse(res, 400, "ID must be a number");

    // ① รับไฟล์ (ตาม homestay)
    const files = req.files as {
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    };

    // ② ตรวจชนิด content-type (ตาม homestay)
    const isMultipart = req.is("multipart/form-data");

    // ③ พาร์ส body (ตาม homestay)
    let parsed: any;
    if (isMultipart) {
      if (!req.body?.data) {
        return createErrorResponse(
          res,
          400,
          "ฟิลด์ 'data' (JSON string) ต้องถูกส่งมาใน multipart/form-data"
        );
      }
      try {
        parsed = JSON.parse(req.body.data);
      } catch {
        return createErrorResponse(res, 400, "ฟิลด์ 'data' ไม่ใช่ JSON ที่ถูกต้อง");
      }
    } else {
      parsed = req.body;
      if (!parsed || typeof parsed !== "object") {
        return createErrorResponse(res, 400, "Body ต้องเป็น JSON object");
      }
    }

    // ④ รวมไฟล์เป็น packageFile[] (เทียบเคียง homestayImage ของตัวอย่าง)
    const packageFile = [
      ...(files?.cover?.map((f) => ({ filePath: f.path, type: "COVER" })) ?? []),
      ...(files?.gallery?.map((f) => ({ filePath: f.path, type: "GALLERY" })) ?? []),
    ];

    // ⑤ อัปเดตแพ็กเกจ (service รองรับ replace เมื่อมี packageFile)
    const updated = await PackageService.editPackageBySuperAdmin(
      id,
      { ...parsed, packageFile },
      uid
    );

    // ⑥ อัปเดตแท็กให้ “เหมือน homestay 100%” (แทนที่ทั้งชุด)
    //    ฝั่ง FE ส่งมาเป็น array ชื่อ `tagIds` (เหมือนที่คุณใช้)
    if (Array.isArray(parsed?.tagIds)) {
      await PackageService.updatePackageTags(
        id,
        parsed.tagIds
          .map((n: any) => Number(n))
          .filter((n: number) => Number.isFinite(n) && n > 0)
      );
    }

    return createResponse(res, 200, "Package Updated", updated);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
}

export async function editPackageAdmin(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const id = Number(req.params.id);
    const result = await PackageService.editPackageByAdmin(id, req.body, uid);
    return createResponse(res, 200, "Package Updated", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function editPackageMember(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const id = Number(req.params.id);
    const result = await PackageService.editPackageByMember(id, req.body, uid);
    return createResponse(res, 200, "Package Updated", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function deletePackageSuperAdmin(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const packageId = Number(req.params.id);
    const result = await PackageService.deletePackageBySuperAdmin(uid, packageId);
    return createResponse(res, 200, "Package Deleted", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function deletePackageAdmin(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const packageId = Number(req.params.id);
    const result = await PackageService.deletePackageByAdmin(uid, packageId);
    return createResponse(res, 200, "Package Deleted", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export async function deletePackageMember(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.id);
    const packageId = Number(req.params.id);
    const result = await PackageService.deletePackageByMember(uid, packageId);
    return createResponse(res, 200, "Package Deleted", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

// + เพิ่มตรงนี้
export async function getPackageDetail(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await PackageService.getPackageDetailById(id);
    if (!result) {
      return createErrorResponse(res, 404, "Package not found");
    }
    return createResponse(res, 200, "Get Package Detail Success", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
}

export const listHomestaysByPackageDto = {
  params: PackageIdParamDto,
  query: QueryHomestaysDto,
} satisfies commonDto;

export const listHomestaysByPackage: TypedHandlerFromDto<
  typeof listHomestaysByPackageDto
> = async (req, res) => {
  try {
    const userId = Number(req.user!.id);
    const id = Number(req.params.id);               // parse ที่นี่
    const { q = "", limit = "8" } = req.query;      // limit เป็น string
    const data = await PackageService.listHomestaysByPackage({
      userId,
      packageId: id,
      q,
      limit: Number(limit),
    });
    return createResponse(res, 200, "fetch homestays successfully", data);
  } catch (err) {
    return createErrorResponse(res, 400, (err as Error).message);
  }
};

// Controllers/community-controller.ts  ⬇️ เพิ่ม schema สำหรับ validate
export const getCommunityMembersDto = {
  params: IdParamDto,
  query: MembersQueryDto,
} satisfies commonDto;

// Controllers/community-controller.ts  ⬇️ เพิ่ม handler
export const getCommunityMembers: TypedHandlerFromDto<
  typeof getCommunityMembersDto
> = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const q = (req.query.q as string) ?? "";
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const result = await PackageService.getCommunityMembersAndAdmin(
      communityId,
      q,
      limit
    );
    return createResponse(res, 200, "Community people fetched", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

export const listCommunityHomestaysDto = {
  query: QueryListHomestaysDto,
} satisfies commonDto;

// Handler
export const listCommunityHomestays: TypedHandlerFromDto<
  typeof listCommunityHomestaysDto
> = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const { q = "", limit = 8 } = req.query;

    const data = await PackageService.listCommunityHomestays({
      userId,
      q,
      limit: Number(limit),
    });

    return createResponse(res, 200, "fetch homestays successfully", data);
  } catch (err) {
    return createErrorResponse(res, 400, (err as Error).message);
  }
};

export const listAllHomestaysSuperAdmin: TypedHandlerFromDto<
  typeof listCommunityHomestaysDto // ใช้ DTO เดียวกัน (q, limit)
> = async (req, res) => {
  try {
    // Super Admin ไม่ต้องใช้ userId
    const { q = "", limit = 8 } = req.query;

    const data = await PackageService.listAllHomestaysSuperAdmin({
      q,
      limit: Number(limit),
    });

    return createResponse(res, 200, "Fetch all homestays successfully", data);
  } catch (err) {
    return createErrorResponse(res, 400, (err as Error).message);
  }
};