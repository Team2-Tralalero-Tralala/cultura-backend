import { Router } from "express";
import * as StoreController from "~/Controllers/store-controller.js";
import { upload } from "~/Libs/uploadFile.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const storeRoute = Router();

/*
 * เส้นทาง : get /super/community/:communityId/store
 * รายละเอียด :
 *   ใช้สำหรับ "ดึงข้อมูลร้านค้าทั้งหมด" 
 *   โดยจำกัดสิทธิ์ให้เฉพาะ superadmin เท่านั้น
 */
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
  "/super/community/:communityId/store",
  // validateDto(StoreController.createStoreDto),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authMiddleware,
  allowRoles("superadmin"),
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

/*
 * เส้นทาง : POST /shared/community/:communityId/store
 * รายละเอียด :
 *   ใช้สำหรับ "สร้างข้อมูลร้านค้าใหม่" ภายในชุมชน
 *   โดยจำกัดสิทธิ์ให้เฉพาะ superadmin และ admin เท่านั้น
 */
storeRoute.post(
  "/admin/community/store",
  // validateDto(StoreController.createStoreDto),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authMiddleware,
  allowRoles("admin"),
  StoreController.createStoreByAdmin
);
/*
 * เส้นทาง : get /admin/community/stores/all
 * รายละเอียด :
 *   ใช้สำหรับ "ดึงข้อมูลร้านค้าทั้งหมด" 
 *   โดยจำกัดสิทธิ์ให้เฉพาะ admin เท่านั้น
 */
storeRoute.get(
    "/admin/community/own/stores/all",
    validateDto(StoreController.getAllStoreForAdminDto),
    authMiddleware,
    allowRoles("admin"),
    StoreController.getAllStoreForAdmin
);

/**
 * @swagger
 * /api/admin/community/stores/{id}:
 *   delete:
 *     summary: Delete a community store (Admin only)
 *     description: ลบร้านค้าภายในชุมชนตามรหัสที่ระบุ (ต้องเป็น Admin เท่านั้น)
 *     tags:
 *       - Store (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสร้านค้าที่ต้องการลบ
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: ลบร้านค้าเรียบร้อยแล้ว
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Store deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "ร้านค้าชุมชนบ้านหนองรี"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-10T10:30:00.000Z"
 *       400:
 *         description: Bad Request (validation failed or other errors)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (token missing or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not allowed role)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Store not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/*
 * เส้นทาง : Delete /admin/community/stores/:id
 * รายละเอียด :
 *   ใช้สำหรับ "modal ลบร้านค้า" 
 *   โดยจำกัดสิทธิ์ให้เฉพาะ admin เท่านั้น
 */
storeRoute.delete(
    "/admin/community/stores/:id",
    validateDto(StoreController.deleteStoreByAdminDto),
    authMiddleware,
    allowRoles("admin"),
    StoreController.deleteStoreByAdmin
);


/**
 * @swagger
 * /api/shared/store/{storeId}/delete:
 *   delete:
 *     summary: Delete a store (SuperAdmin or Admin only)
 *     description: ลบร้านค้าออกจากระบบ (เฉพาะ SuperAdmin และ Admin เท่านั้น)
 *     tags:
 *       - Store
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         description: รหัสของร้านค้าที่ต้องการลบ
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบร้านค้าเรียบร้อยแล้ว
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Store deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "ร้านค้าชุมชนบ้านหนองรี"
 *                     isDeleted:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad Request (invalid input or validation failed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (token not provided or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (user role not allowed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Store not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/*
 * เส้นทาง : DELETE /shared/store/:storeId/delete
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
storeRoute.delete(
  "/shared/store/:storeId/delete",
  validateDto(StoreController.deleteStoreDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  StoreController.deleteStore
);
export default storeRoute;
