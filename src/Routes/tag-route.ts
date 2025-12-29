import { Router } from "express";
import * as TagController from "../Controllers/tag-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const tagRoutes = Router();

/**
 * คำอธิบาย : route สำหรับสร้างประเภทหรือแท็ก
 */
/**
 * @swagger
 * /api/super/tag:
 *   post:
 *     summary: สร้างแท็กใหม่ (เฉพาะ Super Admin)
 *     description: ใช้สำหรับสร้างแท็กใหม่ในระบบ ต้องเข้าสู่ระบบและมีสิทธิ์เป็น Super Admin เท่านั้น
 *     tags:
 *       - Tag
 *     security:
 *       - bearerAuth: []    # ต้องใส่ JWT Bearer token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagDto'
 *     responses:
 *       200:
 *         description: สร้างแท็กสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_Tag'
 *       400:
 *         description: ค่าที่ส่งมาไม่ถูกต้อง หรือแท็กมีอยู่แล้ว
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่ได้รับอนุญาต (Missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ Super Admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *
 * components:
 *   schemas:
 *     TagDto:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 90
 *           example: "สิ่งแวดล้อม"
 *           description: ชื่อของแท็ก (ห้ามว่าง)
 *
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         name:
 *           type: string
 *           example: "สิ่งแวดล้อม"
 *
 *     CreateResponse_Tag:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Tag created successfully"
 *         data:
 *           $ref: '#/components/schemas/Tag'
 *
 *     CreateErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Tag already exists"
 */
tagRoutes.post(
    "/super/tag",
    authMiddleware,
    allowRoles("superadmin"),
    validateDto(TagController.createTagDto),
    TagController.createTag
);

/**
 * คำอธิบาย : route สำหรับลบประเภทหรือแท็ก
 */
/**
 * @swagger
 * /api/super/tag/{tagId}:
 *   patch:
 *     summary: ลบ Tag ตามรหัส (Soft Delete)
 *     description: ใช้สำหรับลบ Tag โดยตั้งค่า isDeleted = true (เฉพาะ Super Admin เท่านั้น)
 *     tags:
 *       - Tag
 *     security:
 *       - bearerAuth: []   # ต้องใส่ JWT Token
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของ Tag ที่ต้องการลบ
 *         example: 17
 *     responses:
 *       200:
 *         description: ลบ Tag สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteTagResponse'
 *       400:
 *         description: ไม่พบ Tag หรือค่าที่ส่งมาไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่ได้รับอนุญาต (Missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ Super Admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 17
 *         name:
 *           type: string
 *           example: "สิ่งแวดล้อม"
 *         isDeleted:
 *           type: boolean
 *           example: true
 *         deleteAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-10T12:34:56.789Z"
 *
 *     DeleteTagResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Tag deleted successfully"
 *         data:
 *           $ref: '#/components/schemas/Tag'
 *
 *     CreateErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Tag not found"
 */
tagRoutes.patch(
    "/super/tag/:tagId",
    authMiddleware,
    allowRoles("superadmin"),
    validateDto(TagController.deleteTagByIdDto),
    TagController.deleteTagById
);

/**
 * คำอธิบาย : route สำหรับแก้ไขประเภทหรือแท็ก
 */
/**
 * @swagger
 * /api/super/tag/{tagId}:
 *   put:
 *     summary: แก้ไขข้อมูล Tag ตามรหัส
 *     description: ใช้สำหรับแก้ไขชื่อของ Tag ที่มีอยู่ (เฉพาะ Super Admin เท่านั้น)
 *     tags:
 *       - Tag
 *     security:
 *       - bearerAuth: []   # ต้องแนบ JWT Token
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของ Tag ที่ต้องการแก้ไข
 *         example: 19
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditTagRequest'
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูล Tag สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EditTagResponse'
 *       400:
 *         description: ไม่พบ Tag หรือข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่ได้รับอนุญาต (Missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ Super Admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *
 * components:
 *   schemas:
 *     EditTagRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 90
 *           description: ชื่อใหม่ของ Tag
 *           example: "สิ่งแวดล้อมและพลังงาน"
 *
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 19
 *         name:
 *           type: string
 *           example: "สิ่งแวดล้อมและพลังงาน"
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         deleteAt:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           example: null
 *
 *     EditTagResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Tag edited successfully"
 *         data:
 *           $ref: '#/components/schemas/Tag'
 *
 *     CreateErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Tag not found"
 */
tagRoutes.put(
    "/super/tag/:tagId",
    authMiddleware,
    allowRoles("superadmin"),
    validateDto(TagController.editTagDto),
    TagController.editTag
);

/**
 * คำอธิบาย : route สำหรับดึงข้อมูลประเภทหรือแท็กมาแสดงทั้งหมด
 */
/**
 * @swagger
 * /api/shared/tags:
 *   get:
 *     summary: ดึงรายการแท็กทั้งหมด (เฉพาะผู้ดูแลระบบ)
 *     description: ใช้สำหรับดึงรายการแท็กทั้งหมดในระบบ ต้องเข้าสู่ระบบและมีสิทธิ์เป็น superadmin หรือ admin
 *     tags:
 *       - Shared
 *     security:
 *       - bearerAuth: []   # Require JWT Bearer token
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: ค้นหาแท็กด้วยชื่อ
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าที่ต้องการดึงข้อมูล
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนข้อมูลต่อหน้า
 *     responses:
 *       200:
 *         description: ดึงรายการแท็กสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse_Tags'
 *       400:
 *         description: ค่าที่ส่งมาไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       401:
 *         description: ไม่ได้รับอนุญาต (Missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึงทรัพยากรนี้
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "สิ่งแวดล้อม"
 *     CreateResponse_Tags:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "ดึงรายการแท็กสำเร็จ"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *     CreateErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "เกิดข้อผิดพลาดในการประมวลผลคำขอ"
 */
tagRoutes.get(
    "/shared/tags",
    authMiddleware,
    allowRoles("superadmin", "admin", "member"),
    validateDto(TagController.getAllTagsDto),
    TagController.getAllTags);

export default tagRoutes;
