import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import * as StoreController from "~/Controllers/store-controller.js";
import type { errorResponse } from "~/Libs/createResponse.js";
import { upload } from "~/Libs/uploadFile.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const storeRoute = Router();

storeRoute.get(
    "/super/community/:communityId/store",
    validateDto(StoreController.getAllStoreDto),
    authMiddleware,
    allowRoles("superadmin"),
    StoreController.getAllStore
);

/*
 * เส้นทาง : POST /shared/community/:communityId/store
 * รายละเอียด :
 *   ใช้สำหรับ "สร้างข้อมูลร้านค้าใหม่" ภายในชุมชน
 *   โดยจำกัดสิทธิ์ให้เฉพาะ superadmin และ admin เท่านั้น
 */
storeRoute.post(
  "/shared/community/:communityId/store",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(StoreController.createStoreDto),
  StoreController.createStore
);

/*
 * เส้นทาง : PUT /shared/store/:storeId
 * รายละเอียด :
 *   ใช้สำหรับ "แก้ไขข้อมูลร้านค้า" ตามรหัสร้าน (storeId)
 *   จำกัดสิทธิ์ให้เฉพาะ superadmin และ admin ที่เกี่ยวข้องกับชุมชนเท่านั้น
 */
storeRoute.put(
  "/shared/store/:storeId",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(StoreController.editStoreDto),
  StoreController.editStore
);

/*
 * เส้นทาง : GET /shared/store/:storeId
 * รายละเอียด :
 *   ใช้สำหรับ "ดึงข้อมูลร้านค้ารายตัว" ตามรหัส storeId
 *   จำกัดสิทธิ์ให้เฉพาะ superadmin และ admin เท่านั้น
 */
storeRoute.get(
  "/shared/store/:storeId",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(StoreController.getStoreByIdDto),
  StoreController.getStoreById
);

/*
 * เส้นทาง : GET /super/community/:communityId/store
 * รายละเอียด :
 *   ใช้สำหรับ "ดึงข้อมูลร้านค้าทั้งหมดในชุมชน" (สำหรับ SuperAdmin)
 */
storeRoute.get(
  "/super/community/:communityId/store",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(StoreController.getAllStoreDto),
  StoreController.getAllStore
);

/*
 * เส้นทาง : PATCH /shared/store/:storeId/delete
 * รายละเอียด :
 *   ใช้สำหรับ "ลบร้านค้า (Soft Delete)" โดยตั้งค่า isDeleted = true
 *   จำกัดสิทธิ์ให้เฉพาะ superadmin และ admin เท่านั้น
 */
storeRoute.patch(
  "/shared/store/:storeId/delete",
  authMiddleware,
  allowRoles("superadmin", "admin"),
  validateDto(StoreController.deleteStoreDto),
  StoreController.deleteStore
);

export default storeRoute;
