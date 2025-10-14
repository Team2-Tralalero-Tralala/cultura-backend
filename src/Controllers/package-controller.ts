// Controllers/package-controller.ts
import type { Request, Response } from "express";
import * as PackageService from "../Services/package/package-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import type { commonDto } from "~/Libs/Types/TypedHandler.js";
import { PackageDto, updatePackageDto } from "~/Services/package/package-dto.js";

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
        const uid = Number((req as any).user?.id);
        const id = Number(req.params.id);
        const result = await PackageService.editPackageBySuperAdmin(id, req.body, uid);
        return createResponse(res, 200, "Package Updated", result);
    } catch (error) {
        return createErrorResponse(res, 400, (error as Error).message);
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
