import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";
import * as storeService from "../Services/storeAdmin-service.js";
import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

/**
 * DTO : storeDto
 * วัตถุประสงค์ : ใช้เป็น DTO สำหรับการเรียกดูข้อมูลรายละเอียดร้านค้า
 * Input : ไม่มี (รับค่าพารามิเตอร์จาก URL)
 * Output : ใช้สำหรับตรวจสอบโครงสร้างข้อมูลก่อนเรียก Controller
 */
export const storeDto = {} satisfies commonDto;

/**
 * คำอธิบาย : (Admin) Handler สำหรับดึงข้อมูลร้านค้าตาม ID
 * Input : รหัสร้านค้าจาก URL path (req.params.id)
 * Output : ดึงข้อมูลสำเร็จ (Response 200), กรณีไม่พบข้อมูลร้านค้า (Response 404), กรณีข้อมูลไม่ถูกต้องหรือเกิดข้อผิดพลาด (Response 400)
 */
export const getStoreById: TypedHandlerFromDto<typeof storeDto> = async (req, res) => {
  try {
    const { id } = req.params as { id?: string };
    if (!id) {
      return createErrorResponse(res, 400, "Missing store id in URL path");
    }

    const storeId = Number(id);
    if (Number.isNaN(storeId)) {
      return createErrorResponse(res, 400, "Invalid store id format");
    }

    const result = await storeService.getStoreById(storeId);
    if (!result) {
      return createErrorResponse(res, 404, "Store not found");
    }

    return createResponse(res, 200, "Fetched store successfully", result);
  } catch (error) {
    console.error("Error in getStoreById:", error);
    return createErrorResponse(res, 400, "Internal server error");
  }
};