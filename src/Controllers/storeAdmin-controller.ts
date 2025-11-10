import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import * as storeService from "../Services/storeAdmin-service.js";
import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

// DTO ยังว่างได้ หากยังไม่ต้องใช้ validation
export const storeDto = {} satisfies commonDto;

/**
 * GET /api/super/stores/:id
 * ใช้สำหรับดึงข้อมูลร้านค้าตาม storeId ที่ส่งมาใน path parameter
 */
export const getStoreById: TypedHandlerFromDto<typeof storeDto> = async (req, res) => {
  try {
    // ดึงค่า id จาก URL เช่น /api/super/stores/5 => id = 5
    const { id } = req.params as { id?: string };
    
    // ตรวจสอบว่ามี id ไหม
    if (!id) {
      return createErrorResponse(res, 400, "Missing store id in URL path");
    }

    // แปลง id เป็นตัวเลข
    const storeId = Number(id);
    if (Number.isNaN(storeId)) {
      return createErrorResponse(res, 400, "Invalid store id format");
    }

    // เรียก service เพื่อดึงข้อมูลร้าน
    const result = await storeService.getStoreById(storeId);

    // ถ้าไม่พบข้อมูล
    if (!result) {
      return createErrorResponse(res, 404, "Store not found");
    }

    // ส่งผลลัพธ์กลับ
    return createResponse(res, 200, "Fetched store successfully", result);
  } catch (error) {
    console.error("Error in getStoreById:", error);
    return createErrorResponse(res, 400, "Internal server error");
  }
};