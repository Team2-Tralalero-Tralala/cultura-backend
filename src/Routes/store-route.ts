import { Router } from "express";
import * as StoreController from "~/Controllers/store-controller.js";
import { upload } from "~/Libs/uploadFile.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const storeRoute = Router();

/*
 * เส้นทาง : POST /shared/community/:communityId/store
 * รายละเอียด :
 *   ใช้สำหรับ "สร้างข้อมูลร้านค้าใหม่" ภายในชุมชน
 *   โดยจำกัดสิทธิ์ให้เฉพาะ superadmin และ admin เท่านั้น
 */
storeRoute.post(
  "/shared/community/:communityId/store",
  // validateDto(StoreController.createStoreDto),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  StoreController.createStore
);

/*
 * เส้นทาง : PUT /shared/store/:storeId
 * รายละเอียด :
 *   ใช้สำหรับ "แก้ไขข้อมูลร้านค้า" ตามรหัสร้าน (storeId)
 *   จำกัดสิทธิ์ให้เฉพาะ superadmin และ admin ที่เกี่ยวข้องกับชุมชนเท่านั้น
 * Middleware :
 *   - validateDto(StoreController.editStoreDto) : ตรวจสอบข้อมูลที่ส่งมา
 *   - authMiddleware : ตรวจสอบ token ของผู้ใช้
 *   - allowRoles("superadmin", "admin") : ตรวจสอบสิทธิ์การแก้ไข
 * Controller :
 *   - StoreController.editStore
 */
storeRoute.put(
  "/shared/store/:storeId",
  // validateDto(StoreController.editStoreDto),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  StoreController.editStore
);

storeRoute.get(
  "/shared/store/:storeId",
  validateDto(StoreController.getStoreByIdDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  StoreController.getStoreById
);
export default storeRoute;


/*
 * เส้นทาง : PATCH /shared/store/:storeId/delete
 * รายละเอียด :
 *   ใช้สำหรับ "ลบร้านค้า (Soft Delete)" โดยตั้งค่า isDeleted = true
 *   จำกัดสิทธิ์ให้เฉพาะ superadmin และ admin ที่เกี่ยวข้องกับชุมชนเท่านั้น
 * Middleware :
 *   - validateDto(StoreController.deleteStoreDto) : ตรวจสอบข้อมูลที่ส่งมา
 *   - authMiddleware : ตรวจสอบ token ของผู้ใช้
 *   - allowRoles("superadmin", "admin") : ตรวจสอบสิทธิ์การลบ
 * Controller :
 *   - StoreController.deleteStore
 */
storeRoute.patch(
  "/shared/store/:storeId/delete",
  validateDto(StoreController.deleteStoreDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  StoreController.deleteStore
);
