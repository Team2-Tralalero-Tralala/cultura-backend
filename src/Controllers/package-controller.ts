import type { Request, Response } from "express";
import * as PackageService from "../Services/package/package-service.js";
import prisma from "~/Services/database-service.js";
import type { commonDto, TypedHandlerFromDto } from "~/Libs/Types/TypedHandler.js";
import { PackageDto, PackageFileDto, updatePackageDto } from "~/Services/package/package-dto.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

/*
 * คำอธิบาย : Schema สำหรับ validate ข้อมูลตอนสร้าง Package
 * Input  : body (PackageDto)
 * Output : commonDto object
 */
export const createPackageDto = {
    body: PackageDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Controller สำหรับสร้าง Package ใหม่
 * Input  : Request body (ข้อมูล PackageDto)
 * Output : JSON response { status, data }
 */
export const createPackage = async (req: Request, res: Response) => {
    try {
        const result = await PackageService.createPackage(req.body);
        return res.json({ status:200, data: result });
    } catch (error: any) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

/*
 * คำอธิบาย : ดึงรายการ Package ตามบทบาท (role) ของ user
 * Input  : userId (จาก params)
 * Output : JSON response { status, role, data }
 */
export const getPackageByRole = async (req: Request, res: Response) => {
    try {
        const id  = req.user.id;
        const result = await PackageService.getPackageByRole(Number(id));
        return createResponse(res, 200, "Get Packages Success", {result})
        /* ********************************************************** */
    } catch (error: any) {
        return createErrorResponse(res, 404, (error as Error).message)
    }
}

/*
 * คำอธิบาย : Schema สำหรับ validate ข้อมูลตอนแก้ไข Package
 * Input  : body (updatePackageDto)
 * Output : commonDto object
 */
export const editPackageDto = {
    body: updatePackageDto
} satisfies commonDto;

/*
 * คำอธิบาย : Controller สำหรับแก้ไข Package
 * Input  : packageId (จาก params), Request body (updatePackageDto)
 * Output : JSON response { status, message, data }
 */
export const editPackage =  async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return createErrorResponse(res, 400, "ID must be a number");
        }
        const data = req.body;
        const result = await PackageService.editPackage(id, data)
        return createResponse(res, 200, "Package Updated", result)
    } catch (error: any) {
        return createErrorResponse(res, 404, (error as Error).message)
    }
}

/*
 * คำอธิบาย : Controller สำหรับลบ Package
 * Input  : packageId (จาก params)
 * Output : JSON response { status, message }
 */
export const deletePackage = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return createErrorResponse(res, 400, "ID must be a number");
        }
        const result = await PackageService.deletePackage(id);
        return createResponse(res, 200, "Package Deleted", result)
    } catch (error: any) {
        return createErrorResponse(res, 404, (error as Error).message)
    }
}