import type { Request , Response } from "express";
import * as PackageService from "../Services/package-service.js"
import { createResponse, createErrorResponse } from "../Libs/createResponse.js";

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = req.user; // มาจาก middleware ที่ตรวจ token แล้ว

    if (isNaN(id)) {
      return createErrorResponse(res, 400, 'Invalid package id');
    }

    const pkg = await PackageService.getPackageById(id);
    if (!pkg) {
      return createErrorResponse(res, 404, 'Package not found');
    }

    // ดึงข้อมูลร้านค้า + ที่พัก ตาม role
    const stores = await PackageService.getStoresByRole(
      user.role,
      user.id || null,
      pkg.communityId
    );

    const homestays = await PackageService.getHomestaysByRole(
      user.role,
      user.id || null,
      pkg.communityId
    );

    // รวมข้อมูลทั้งหมด
    const result = {
      package: pkg,
      stores,
      homestays,
    };

    return createResponse(res, 200, 'Package fetched successfully', result);
  } catch (err) {
    console.error(err);
    return createErrorResponse(res, 500, 'Internal server error');
  }
};
