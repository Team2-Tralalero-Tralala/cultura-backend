import { Router } from "express";
import * as StoreController from "~/Controllers/store-controller.js";
import { upload } from "~/Libs/uploadFile.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const storeRoute = Router();

/*
 * คำอธิบาย : route สำหรับดึงข้อมูลร้านค้าทั้งหมดในชุมชนตาม communityId สำหรับ super admin
 */
/**
 * @swagger
 * /api/super/community/{communityId}/store:
 *   get:
 *     summary: ดึงข้อมูลร้านค้าทั้งหมดในชุมชน (เฉพาะ superadmin)
 *     description: ดึงข้อมูลร้านค้าทั้งหมดในชุมชนตาม communityId พร้อม pagination (ต้องมีสิทธิ์เป็น superadmin)
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสชุมชน
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าที่ต้องการ
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนข้อมูลต่อหน้า
 *     responses:
 *       200:
 *         description: ดึงข้อมูลร้านค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: All stores in Community
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: ร้านค้าชุมชน A
 *                           detail:
 *                             type: string
 *                             example: ร้านค้าขายสินค้าในท้องถิ่น
 *                           tagStores:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 tag:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                     name:
 *                                       type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalCount:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       400:
 *         description: คำขอไม่ถูกต้อง (Bad Request)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ผู้ใช้ยังไม่ได้รับการยืนยันตัวตน
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น superadmin เท่านั้น)
 */
storeRoute.get(
  "/super/community/:communityId/store",
  authMiddleware,
  allowRoles("superadmin"),
  validateDto(StoreController.getAllStoreDto),
  StoreController.getAllStore
);

/*
 * คำอธิบาย : สร้างข้อมูลร้านค้าใหม่ภายในชุมชน
 */
/**
 * @swagger
 * /api/super/community/{communityId}/store:
 *   post:
 *     summary: สร้างข้อมูลร้านค้าใหม่ในชุมชน
 *     description: |
 *       API สำหรับ Super Admin เพื่อสร้างร้านค้าใหม่ในชุมชนที่ระบุ
 *       รองรับการอัปโหลดรูปภาพ **cover** (1 รูป) และ **gallery** (สูงสุด 5 รูป)
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของชุมชนที่ต้องการเพิ่มร้านค้า
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - detail
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: ร้านกาแฟชุมชนบ้านสวน
 *               detail:
 *                 type: string
 *                 example: ร้านกาแฟบรรยากาศชุมชน มีมุมกาแฟสดและของฝากจากชาวบ้าน
 *               location:
 *                 type: object
 *                 properties:
 *                   houseNumber:
 *                     type: string
 *                     example: 123
 *                   subDistrict:
 *                     type: string
 *                     example: บ้านเหนือ
 *                   district:
 *                     type: string
 *                     example: เมือง
 *                   province:
 *                     type: string
 *                     example: เชียงราย
 *                   postalCode:
 *                     type: string
 *                     example: 57000
 *                   latitude:
 *                     type: number
 *                     example: 19.9074
 *                   longitude:
 *                     type: number
 *                     example: 99.8325
 *               tagStores:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 5]
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพหน้าปก (1 รูป)
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: รูปภาพเพิ่มเติมของร้านค้า (สูงสุด 5 รูป)
 *     responses:
 *       201:
 *         description: สร้างร้านค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Store created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     name:
 *                       type: string
 *                       example: ร้านกาแฟชุมชนบ้านสวน
 *                     detail:
 *                       type: string
 *                       example: ร้านกาแฟบรรยากาศชุมชน มีมุมกาแฟสดและของฝากจากชาวบ้าน
 *                     communityId:
 *                       type: integer
 *                       example: 1
 *                     locationId:
 *                       type: integer
 *                       example: 5
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     deleteAt:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     storeImage:
 *                       type: array
 *                       description: รายการรูปภาพของร้านค้า (ถ้ามี)
 *                       items:
 *                         type: object
 *                     location:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 5
 *                         detail:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         houseNumber:
 *                           type: string
 *                           example: 123
 *                         villageNumber:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         alley:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         subDistrict:
 *                           type: string
 *                           example: บ้านเหนือ
 *                         district:
 *                           type: string
 *                           example: เมือง
 *                         province:
 *                           type: string
 *                           example: เชียงราย
 *                         postalCode:
 *                           type: string
 *                           example: 57000
 *                         latitude:
 *                           type: number
 *                           example: 19.9074
 *                         longitude:
 *                           type: number
 *                           example: 99.8325
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ Prisma validation ผิดพลาด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: |
 *                     Invalid `transaction.store.create()` invocation in
 *                     D:\\3-1-2568\\TSP\\cultura-backend\\src\\Services\\store\\store-service.ts:25:46
 *
 *                     Argument `name` is missing.
 *                 errorId:
 *                   type: string
 *                   example: a10736e4-da6d-43ef-82b5-a3fa6ef441d1
 *       401:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Missing Token
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (สิทธิ์ไม่เพียงพอ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Forbidden
 */
storeRoute.post(
  "/super/community/:communityId/store",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authMiddleware,
  allowRoles("superadmin"),
  StoreController.createStore
);

/*
 * คำอธิบาย : ใช้สำหรับ "แก้ไขข้อมูลร้านค้า" ตามรหัสร้าน (storeId)
 */
/**
 * @swagger
 * /api/shared/store/{storeId}:
 *   put:
 *     summary: แก้ไขข้อมูลร้านค้า
 *     description: |
 *       API สำหรับ Super Admin หรือ Admin เพื่อแก้ไขข้อมูลร้านค้าในระบบ
 *       รองรับการอัปโหลดรูปภาพใหม่ (cover, gallery) หรือคงของเดิมไว้ได้
 *       ถ้าไม่ส่งไฟล์ ระบบจะไม่อัปเดตรูปภาพเดิม
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสร้านค้าที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: ร้านกาแฟชุมชนบ้านสวน
 *               detail:
 *                 type: string
 *                 example: ร้านกาแฟบรรยากาศชุมชน มีมุมกาแฟสดและของฝากจากชาวบ้าน
 *               location:
 *                 type: object
 *                 description: ข้อมูลที่อยู่ของร้านค้า
 *                 properties:
 *                   houseNumber:
 *                     type: string
 *                     example: 123
 *                   subDistrict:
 *                     type: string
 *                     example: บ้านเหนือ
 *                   district:
 *                     type: string
 *                     example: เมือง
 *                   province:
 *                     type: string
 *                     example: เชียงราย
 *                   postalCode:
 *                     type: string
 *                     example: 57000
 *                   latitude:
 *                     type: number
 *                     example: 19.9074
 *                   longitude:
 *                     type: number
 *                     example: 99.8325
 *               tagStores:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 5]
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพหน้าปก (ถ้าไม่ส่งจะคงของเดิมไว้)
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: รูปภาพเพิ่มเติมของร้านค้า (ถ้าไม่ส่งจะคงของเดิมไว้)
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลร้านค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Store updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: ร้านกาแฟชุมชนบ้านสวน
 *                     detail:
 *                       type: string
 *                       example: ร้านกาแฟบรรยากาศชุมชน มีมุมกาแฟสดและของฝากจากชาวบ้าน
 *                     communityId:
 *                       type: integer
 *                       example: 1
 *                     locationId:
 *                       type: integer
 *                       example: 1
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     deleteAt:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     storeImage:
 *                       type: array
 *                       description: รายการรูปภาพของร้านค้า (cover, gallery)
 *                       items:
 *                         type: object
 *                       example: []
 *                     location:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         detail:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         houseNumber:
 *                           type: string
 *                           example: 123
 *                         villageNumber:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         alley:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         subDistrict:
 *                           type: string
 *                           example: บ้านเหนือ
 *                         district:
 *                           type: string
 *                           example: เมือง
 *                         province:
 *                           type: string
 *                           example: เชียงราย
 *                         postalCode:
 *                           type: string
 *                           example: 57000
 *                         latitude:
 *                           type: number
 *                           example: 19.9074
 *                         longitude:
 *                           type: number
 *                           example: 99.8325
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ Prisma validation ผิดพลาด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Invalid `transaction.store.update()` invocation: Missing name field"
 *                 errorId:
 *                   type: string
 *                   example: e734fa20-b13f-4ec9-9f1a-734dbe222d21
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น Super Admin หรือ Admin)
 *       404:
 *         description: ไม่พบร้านค้าตาม storeId ที่ระบุ
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

storeRoute.put(
  "/shared/store/:storeId",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  StoreController.editStore
);
/**
 * คำอธิบาย : สำหรับดึงข้อมูลร้านค้าตาม id
 */
/**
 * @swagger
 * /api/community/stores/{storeId}:
 *   get:
 *     summary: ดึงข้อมูลร้านค้าตามรหัส (Store ID)
 *     description: ใช้สำหรับดึงรายละเอียดร้านค้า พร้อมข้อมูลตำแหน่ง พิกัด และแท็กของร้านนั้นๆ เฉพาะผู้มีสิทธิ์ superadmin หรือ admin เท่านั้น
 *     tags:
 *       - Store
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         description: รหัสร้านค้าที่ต้องการค้นหา
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: ดึงข้อมูลร้านค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Get store successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: ร้านกาแฟชุมชนบ้านสวน
 *                     detail:
 *                       type: string
 *                       example: ร้านกาแฟบรรยากาศชุมชน มีมุมกาแฟสดและของฝากจากชาวบ้าน
 *                     storeImage:
 *                       type: array
 *                       description: รายการรูปภาพของร้าน
 *                       items:
 *                         type: object
 *                     tagStores:
 *                       type: array
 *                       description: รายการแท็กที่เชื่อมกับร้านนี้
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: Nature
 *                     location:
 *                       type: object
 *                       description: ข้อมูลที่อยู่ของร้าน
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         detail:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         houseNumber:
 *                           type: string
 *                           example: "123"
 *                         villageNumber:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         alley:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         subDistrict:
 *                           type: string
 *                           example: บ้านเหนือ
 *                         district:
 *                           type: string
 *                           example: เมือง
 *                         province:
 *                           type: string
 *                           example: เชียงราย
 *                         postalCode:
 *                           type: string
 *                           example: "57000"
 *                         latitude:
 *                           type: number
 *                           example: 19.9074
 *                         longitude:
 *                           type: number
 *                           example: 99.8325
 *       400:
 *         description: ค่าที่ส่งมาไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Invalid store ID
 *       404:
 *         description: ไม่พบร้านค้าตามรหัสที่ระบุ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: ไม่พบข้อมูลร้านค้า
 */
storeRoute.get(
  "/community/stores/:storeId",
  validateDto(StoreController.getStoreByIdDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  StoreController.getStoreById
);

/*
 * คำอธิบาย : ใช้สำหรับสร้างข้อมูลร้านค้าใหม่ภายในชุมชน
 */
/**
 * @swagger
 * /api/admin/community/store:
 *   post:
 *     summary: เพิ่มร้านค้าใหม่ในชุมชนของผู้ดูแล (Admin)
 *     description: สร้างข้อมูลร้านค้าพร้อมตำแหน่ง พิกัด และรูปภาพ โดยผู้ดูแลชุมชน (admin) เท่านั้น
 *     tags:
 *       - Store
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - detail
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: ร้านกาแฟชุมชนบ้านสวน
 *               detail:
 *                 type: string
 *                 example: ร้านกาแฟบรรยากาศชุมชน มีมุมกาแฟสดและของฝากจากชาวบ้าน
 *               location[houseNumber]:
 *                 type: string
 *                 example: "123"
 *               location[subDistrict]:
 *                 type: string
 *                 example: บ้านเหนือ
 *               location[district]:
 *                 type: string
 *                 example: เมือง
 *               location[province]:
 *                 type: string
 *                 example: เชียงราย
 *               location[postalCode]:
 *                 type: string
 *                 example: "57000"
 *               location[latitude]:
 *                 type: number
 *                 example: 19.9074
 *               location[longitude]:
 *                 type: number
 *                 example: 99.8325
 *               tagStores:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   example: 1
 *                 description: รหัสแท็กที่เกี่ยวข้องกับร้าน (Tag IDs)
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพปกของร้าน
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: รูปภาพเพิ่มเติมของร้าน
 *     responses:
 *       200:
 *         description: สร้างร้านค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Store created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: ร้านกาแฟชุมชนบ้านสวน
 *                     detail:
 *                       type: string
 *                       example: ร้านกาแฟบรรยากาศชุมชน มีมุมกาแฟสดและของฝากจากชาวบ้าน
 *                     communityId:
 *                       type: integer
 *                       example: 1
 *                     location:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         houseNumber:
 *                           type: string
 *                           example: "123"
 *                         subDistrict:
 *                           type: string
 *                           example: บ้านเหนือ
 *                         district:
 *                           type: string
 *                           example: เมือง
 *                         province:
 *                           type: string
 *                           example: เชียงราย
 *                         postalCode:
 *                           type: string
 *                           example: "57000"
 *                         latitude:
 *                           type: number
 *                           example: 19.9074
 *                         longitude:
 *                           type: number
 *                           example: 99.8325
 *                     storeImage:
 *                       type: array
 *                       description: รายการรูปภาพของร้าน (cover และ gallery)
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 10
 *                           url:
 *                             type: string
 *                             example: uploads/store/cover_1731250987210.jpg
 *                           type:
 *                             type: string
 *                             enum: [COVER, GALLERY]
 *                             example: COVER
 *                     tagStores:
 *                       type: array
 *                       description: รายการแท็กของร้านนี้
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: Nature
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ Prisma validation ผิดพลาด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: |
 *                     Invalid `transaction.store.create()` invocation in
 *                     D:\\3-1-2568\\TSP\\cultura-backend\\src\\Services\\store\\store-service.ts:25:46
 *
 *                     Argument `name` is missing.
 *                 errorId:
 *                   type: string
 *                   example: a10736e4-da6d-43ef-82b5-a3fa6ef441d1
 *       401:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Missing Token
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (สิทธิ์ไม่เพียงพอ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Forbidden
 */

storeRoute.post(
  "/admin/community/store",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authMiddleware,
  allowRoles("admin"),
  StoreController.createStoreByAdmin
);

/*
 * คำอธิบาย : ดึงข้อมูลร้านค้าทั้งหมดในชุมชนสำหรับ admin
 */
/**
 * @swagger
 * /api/admin/community/own/stores/all:
 *   get:
 *     summary: ดึงข้อมูลร้านค้าทั้งหมดในชุมชนของแอดมิน
 *     description: >
 *       ใช้สำหรับดึงข้อมูลร้านค้าทั้งหมดที่อยู่ในชุมชนของผู้ใช้ที่มี role เป็น **admin**
 *       รองรับการแบ่งหน้า (pagination) ผ่าน query parameters
 *     tags:
 *       - Store (Admin)
 *     security:
 *       - bearerAuth: []        # 🔐 ต้องส่ง JWT Token
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: หน้าที่ต้องการ (ค่าเริ่มต้นคือ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: จำนวนรายการต่อหน้า (ค่าเริ่มต้นคือ 10)
 *     responses:
 *       200:
 *         description: ดึงข้อมูลร้านค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All stores for admin
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 12
 *                           name:
 *                             type: string
 *                             example: ร้านครัวบ้านสวน
 *                           detail:
 *                             type: string
 *                             example: ร้านอาหารพื้นบ้านและของฝาก
 *                           tagStores:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 tag:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 1
 *                                     name:
 *                                       type: string
 *                                       example: อาหาร
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalCount:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *       400:
 *         description: ข้อมูลไม่ถูกต้องหรือเกิดข้อผิดพลาด
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้รับอนุญาต (Unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
storeRoute.get(
  "/admin/community/own/stores/all",
  authMiddleware,
  allowRoles("admin"),
  validateDto(StoreController.getAllStoreForAdminDto),
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

/**
 * @swagger
 * /api/shared/community/{communityId}/store/{storeId}:
 *   get:
 *     summary: ดึงรายละเอียดร้านค้า พร้อมร้านอื่นในชุมชนเดียวกัน
 *     description: |
 *       ใช้สำหรับแสดงรายละเอียดของร้านค้าที่เลือก
 *       พร้อมดึงรายการร้านค้าอื่น ๆ ที่อยู่ในชุมชนเดียวกันแบบแบ่งหน้า (pagination)
 *     tags:
 *       - Shared / Store
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสชุมชน
 *
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสร้านค้าที่ต้องการดูรายละเอียด
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าที่ต้องการ (เริ่มต้นที่ 1)
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 12
 *         description: จำนวนร้านค้าอื่นต่อหน้า
 *
 *     responses:
 *       200:
 *         description: ดึงข้อมูลร้านค้าและร้านอื่นในชุมชนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Get store with other stores in community
 *                 data:
 *                   type: object
 *                   properties:
 *                     store:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 23
 *                         name:
 *                           type: string
 *                           example: ร้านกาแฟชุมชน
 *                         detail:
 *                           type: string
 *                           example: ร้านกาแฟบรรยากาศอบอุ่น
 *                         storeImage:
 *                           type: array
 *                           items:
 *                             type: object
 *                         communityId:
 *                           type: integer
 *                           example: 1
 *                         location:
 *                           type: object
 *                         tagStores:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               tag:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   name:
 *                                     type: string
 *
 *                     otherStores:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 5
 *                               name:
 *                                 type: string
 *                                 example: ร้านของฝากชุมชน
 *                               storeImage:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage:
 *                               type: integer
 *                               example: 1
 *                             limit:
 *                               type: integer
 *                               example: 12
 *                             totalCount:
 *                               type: integer
 *                               example: 20
 *                             totalPages:
 *                               type: integer
 *                               example: 2
 *
 *       400:
 *         description: พารามิเตอร์ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid parameter
 *
 *       404:
 *         description: ไม่พบชุมชนหรือร้านค้าที่ระบุ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Store not found
 */

/*
 * คำอธิบาย : ใช้สำหรับแสดงรายละเอียดร้านค้าที่เลือก พร้อมดึงรายชื่อร้านค้าอื่น ๆ ที่อยู่ในชุมชนเดียวกัน
 */
storeRoute.get(
  "/shared/community/:communityId/store/:storeId",
  validateDto(StoreController.getStoreWithOtherStoresInCommunityDto),
  StoreController.getStoreWithOtherStoresInCommunity
);
/**
 * @swagger
 * /api/admin/stores/{id}:
 *   get:
 *     summary: ดึงข้อมูลร้านค้าตาม storeId
 *     description: ดึงข้อมูลร้านค้าพร้อมรูปภาพ แท็ก ชุมชน และตำแหน่งที่ตั้ง
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         example: 1
 *         required: true
 *         description: ID ของร้านค้าที่ต้องการดึง
 *     responses:
 *       200:
 *         description: Fetched store successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Fetched store successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: ร้านกาแฟ
 *                     detail:
 *                       type: string
 *                       example: รายละเอียดร้าน
 *                     storeImage:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                             example: 1
 *                           image:
 *                             type: string
 *                             example: image-url.jpg
 *                           type:
 *                             type: string
 *                             example: thumbnail
 *                     tagStores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: number
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: กาแฟ
 *                     community:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: ชุมชน A
 *                     location:
 *                       type: object
 *                       properties:
 *                         lat:
 *                           type: number
 *                           example: 13.7563
 *                         lng:
 *                           type: number
 *                           example: 100.5018
 *       400:
 *         description: Bad request / Invalid store id
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               message: Missing store id in URL path
 *       404:
 *         description: Store not found
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               message: Store not found
 */
/**
 * คำอธิบาย : (Admin) Route สำหรับดึงข้อมูลรายละเอียดร้านค้า ตาม ID
 */
storeRoute.get(
  "/:id",
  authMiddleware,
  validateDto(StoreController.storeDto),
  allowRoles("admin"),
  StoreController.getStoreByIdShared
);
/**
 * @swagger
 * /api/ssuper/stores/{id}:
 *   get:
 *     summary: ดึงข้อมูลร้านค้าตาม storeId
 *     description: ดึงข้อมูลร้านค้าพร้อมรูปภาพ แท็ก ชุมชน และตำแหน่งที่ตั้ง
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         example: 1
 *         required: true
 *         description: ID ของร้านค้าที่ต้องการดึง
 *     responses:
 *       200:
 *         description: Fetched store successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Fetched store successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: ร้านกาแฟ
 *                     detail:
 *                       type: string
 *                       example: รายละเอียดร้าน
 *                     storeImage:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                             example: 1
 *                           image:
 *                             type: string
 *                             example: image-url.jpg
 *                           type:
 *                             type: string
 *                             example: thumbnail
 *                     tagStores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: number
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: กาแฟ
 *                     community:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: ชุมชน A
 *                     location:
 *                       type: object
 *                       properties:
 *                         lat:
 *                           type: number
 *                           example: 13.7563
 *                         lng:
 *                           type: number
 *                           example: 100.5018
 *       400:
 *         description: Bad request / Invalid store id
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               message: Missing store id in URL path
 *       404:
 *         description: Store not found
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               message: Store not found
 */
/**
 * คำอธิบาย : (Super Admin) Route สำหรับดึงข้อมูลรายละเอียดร้านค้า ตาม ID
 */
storeRoute.get(
  "/super/store/:id",
  authMiddleware,
  validateDto(StoreController.storeDto),
  allowRoles("superadmin"),
  StoreController.getStoreByIdShared
);
export default storeRoute;
