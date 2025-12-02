// src/Routes/account-routes.ts
/**
 * Module: Account Routes
 * Description: เส้นทาง API สำหรับการจัดการบัญชีผู้ใช้ในระบบ Cultura
 * Role Access: SuperAdmin, Admin, Member
 * Author: Team 2 (Cultura)
 * Last Modified: 21 ตุลาคม 2568
 */

import { Router } from "express";
import {
  createAccount,
  createAccountDto,
  editAccount,
  editAccountDto,
  getAccountById,
  getAll,
  getMemberByAdmin,
} from "../Controllers/account-controller.js";
import * as AccountController from "../Controllers/account-controller.js";
import { validateDto } from "../Libs/validateDto.js";
import { authMiddleware, allowRoles } from "../Middlewares/auth-middleware.js";

const accountRoutes = Router();

/**
 * @swagger
 * /api/super/account/admin:
 *   post:
 *     summary: สร้างบัญชีผู้ใช้ใหม่ (ประเภท Admin)
 *     description: ใช้สำหรับ SuperAdmin เพื่อสร้างบัญชีผู้ใช้ใหม่ประเภท Admin ในระบบ
 *     tags:
 *       - Account (SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountDto'
 *           example:
 *             username: "admin001"
 *             password: "12345678"
 *             email: "admin001@gmail.com"
 *             phone: "0812345678"
 *             fname: "สมชาย"
 *             lname: "ใจดี"
 *             roleId: 2
 *     responses:
 *       201:
 *         description: สร้างบัญชีผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ DTO ตรวจสอบไม่ผ่าน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route POST /super/account/admin
 * @description สร้างบัญชีผู้ใช้ Role: Admin
 * @access SuperAdmin
 */
accountRoutes.post(
  "/super/account/admin",
  validateDto(createAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  createAccount
);

/**
 * @swagger
 * /api/super/account/member:
 *   post:
 *     summary: สร้างบัญชีผู้ใช้ใหม่ (ประเภท Member)
 *     description: ใช้สำหรับ SuperAdmin เพื่อสร้างบัญชีผู้ใช้ใหม่ประเภท Member ในระบบ
 *     tags:
 *       - Account (SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountDto'
 *           example:
 *             username: "member001"
 *             password: "12345678"
 *             email: "member001@gmail.com"
 *             phone: "0818888888"
 *             fname: "สมหญิง"
 *             lname: "สุขใจ"
 *             roleId: 3
 *     responses:
 *       201:
 *         description: สร้างบัญชีผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ DTO ตรวจสอบไม่ผ่าน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route POST /super/account/member
 * @description สร้างบัญชีผู้ใช้ Role: Member
 * @access SuperAdmin
 */
accountRoutes.post(
  "/super/account/member",
  validateDto(createAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  createAccount
);

/**
 * @swagger
 * /api/super/account/tourist:
 *   post:
 *     summary: สร้างบัญชีผู้ใช้ใหม่ (ประเภท Tourist)
 *     description: ใช้สำหรับ SuperAdmin เพื่อสร้างบัญชีผู้ใช้ใหม่ประเภท Tourist ในระบบ
 *     tags:
 *       - Account (SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountDto'
 *           example:
 *             username: "tourist001"
 *             password: "12345678"
 *             email: "tourist001@gmail.com"
 *             phone: "0817777777"
 *             fname: "สมปอง"
 *             lname: "เบิกบาน"
 *             roleId: 4
 *     responses:
 *       201:
 *         description: สร้างบัญชีผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateResponse'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ DTO ตรวจสอบไม่ผ่าน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route POST /super/account/tourist
 * @description สร้างบัญชีผู้ใช้ Role: Tourist
 * @access SuperAdmin
 */
accountRoutes.post(
  "/super/account/tourist",
  validateDto(createAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  createAccount
);

/**
 * @route GET /super/account/:role/:id
 * @description ดึงข้อมูลผู้ใช้ตามบทบาท (Admin / Member / Tourist)
 * @access SuperAdmin
 */
/**
 * @swagger
 * /api/super/account/admin/{id}:
 *   get:
 *     summary: ดึงข้อมูลบัญชีผู้ใช้ (ประเภท Admin)
 *     description: ใช้สำหรับ SuperAdmin เพื่อดึงรายละเอียดข้อมูลบัญชีผู้ใช้ประเภท Admin ตาม ID
 *     tags:
 *       - Account (SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสบัญชีผู้ใช้ (Admin) ที่ต้องการดึงข้อมูล
 *         schema:
 *           type: integer
 *           example: 43
 *     responses:
 *       200:
 *         description: ดึงข้อมูลบัญชีผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountDetailResponse'
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: ไม่พบบัญชีผู้ใช้ที่ต้องการ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
accountRoutes.get(
  "/super/account/admin/:id",
  authMiddleware,
  allowRoles("superadmin"),
  getAccountById
);

/**
 * @swagger
 * /api/super/account/member/{id}:
 *   get:
 *     summary: ดึงข้อมูลบัญชีผู้ใช้ (ประเภท Member)
 *     description: ใช้สำหรับ SuperAdmin เพื่อดึงรายละเอียดข้อมูลบัญชีผู้ใช้ประเภท Member ตาม ID
 *     tags:
 *       - Account (SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสบัญชีผู้ใช้ (Member) ที่ต้องการดึงข้อมูล
 *         schema:
 *           type: integer
 *           example: 41
 *     responses:
 *       200:
 *         description: ดึงข้อมูลบัญชีผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountDetailResponse'
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: ไม่พบบัญชีผู้ใช้ที่ต้องการ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
accountRoutes.get(
  "/super/account/member/:id",
  authMiddleware,
  allowRoles("superadmin"),
  getAccountById
);

/**
 * @swagger
 * /api/super/account/tourist/{id}:
 *   get:
 *     summary: ดึงข้อมูลบัญชีผู้ใช้ (ประเภท Tourist)
 *     description: ใช้สำหรับ SuperAdmin เพื่อดึงรายละเอียดข้อมูลบัญชีผู้ใช้ประเภท Tourist ตาม ID
 *     tags:
 *       - Account (SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสบัญชีผู้ใช้ (Tourist) ที่ต้องการดึงข้อมูล
 *         schema:
 *           type: integer
 *           example: 42
 *     responses:
 *       200:
 *         description: ดึงข้อมูลบัญชีผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountDetailResponse'
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: ไม่พบบัญชีผู้ใช้ที่ต้องการ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
accountRoutes.get(
  "/super/account/tourist/:id",
  authMiddleware,
  allowRoles("superadmin"),
  getAccountById
);

/**
 * @route PUT /super/account/:role/:id
 * @description อัปเดตข้อมูลบัญชีผู้ใช้ตามบทบาท (Admin / Member / Tourist)
 * @access SuperAdmin
 */
/**
 * @swagger
 * /api/super/account/admin/{id}:
 *   put:
 *     summary: แก้ไขข้อมูลบัญชีผู้ใช้ (ประเภท Admin)
 *     description: ใช้สำหรับ SuperAdmin เพื่อแก้ไขข้อมูลบัญชีผู้ใช้ประเภท Admin
 *     tags:
 *       - Account (SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสบัญชีผู้ใช้ที่ต้องการแก้ไข
 *         schema:
 *           type: integer
 *           example: 43
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditAccountDto'
 *           example:
 *             email: "admin001_update@gmail.com"
 *             phone: "0812349999"
 *             fname: "สมชาย"
 *             lname: "อัปเดต"
 *             status: "ACTIVE"
 *     responses:
 *       200:
 *         description: แก้ไขบัญชีผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EditResponse'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ DTO ตรวจสอบไม่ผ่าน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
accountRoutes.put(
  "/super/account/admin/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);

/**
 * @swagger
 * /api/super/account/member/{id}:
 *   put:
 *     summary: แก้ไขข้อมูลบัญชีผู้ใช้ (ประเภท Member)
 *     description: ใช้สำหรับ SuperAdmin เพื่อแก้ไขข้อมูลบัญชีผู้ใช้ประเภท Member
 *     tags:
 *       - Account (SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสบัญชีผู้ใช้ที่ต้องการแก้ไข
 *         schema:
 *           type: integer
 *           example: 41
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditAccountDto'
 *           example:
 *             email: "member001_update@gmail.com"
 *             phone: "0818880000"
 *             fname: "สมหญิง"
 *             lname: "ปรับปรุง"
 *             status: "INACTIVE"
 *     responses:
 *       200:
 *         description: แก้ไขบัญชีผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EditResponse'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ DTO ตรวจสอบไม่ผ่าน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
accountRoutes.put(
  "/super/account/member/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);

/**
 * @swagger
 * /api/super/account/tourist/{id}:
 *   put:
 *     summary: แก้ไขข้อมูลบัญชีผู้ใช้ (ประเภท Tourist)
 *     description: ใช้สำหรับ SuperAdmin เพื่อแก้ไขข้อมูลบัญชีผู้ใช้ประเภท Tourist
 *     tags:
 *       - Account (SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสบัญชีผู้ใช้ที่ต้องการแก้ไข
 *         schema:
 *           type: integer
 *           example: 42
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditAccountDto'
 *           example:
 *             email: "tourist001_update@gmail.com"
 *             phone: "0817770000"
 *             fname: "สมปอง"
 *             lname: "เบิกบาน"
 *             status: "ACTIVE"
 *     responses:
 *       200:
 *         description: แก้ไขบัญชีผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EditResponse'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ DTO ตรวจสอบไม่ผ่าน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
accountRoutes.put(
  "/super/account/tourist/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);
/**
 * @swagger
 * /api/super/community/{communityId}/accounts:
 *   get:
 *     summary: ดึงข้อมูลบัญชีผู้ใช้ในชุมชน
 *     description: ใช้สำหรับ SuperAdmin เพื่อดึงข้อมูลบัญชีผู้ใช้ในชุมชนตามรหัส `communityId`
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: รหัสชุมชน
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าที่ต้องการแสดง
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: ดึงข้อมูลบัญชีผู้ใช้ในชุมชนสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: "get account in community successfully"
 *               data:
 *                 - id: 1
 *                   fname: "Somchai"
 *                   lname: "Jaidee"
 *                   email: "somchai@example.com"
 *                   activityRole: "Volunteer"
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 5
 *                 totalCount: 50
 *                 limit: 10
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือ DTO ตรวจสอบไม่ผ่าน
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "ข้อมูลไม่ถูกต้อง"
 *       401:
 *         description: ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (เฉพาะ SuperAdmin เท่านั้น)
 *         content:
 *           application/json:
 *             example:
 *               status: 403
 *               error: true
 *               message: "Forbidden"
 */
/*
 * คำอธิบาย : ดึงข้อมูลบัญชีผู้ใช้ในชุมชน
 */
accountRoutes.get(
  "/super/community/:communityId/accounts",
  validateDto(AccountController.getAccountInCommunityDto),
  authMiddleware,
  allowRoles("superadmin"),
  AccountController.getAccountInCommunity
);


/** --------------------------------------------------------------------------
 * @route GET /admin/communities/members
 * @description ดึงข้อมูลสมาชิกในชุมชนของตนเอง (เฉพาะ Admin)
 * @access Admin
 * -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/admin/communities/members:
 *   get:
 *     tags:
 *       - Admin - Communities
 *     summary: Get list of community members
 *     description: |
 *       ดึงรายการสมาชิกในชุมชน (Communities Members) สำหรับผู้ใช้ที่มีสิทธิ์ **admin** เท่านั้น  
 *       Endpoint นี้รองรับการแบ่งหน้า (pagination) ผ่าน query parameter `page` และ `limit`  
 *       Response ทั้งหมดอยู่ในรูปแบบ `createResponse` หรือ `createErrorResponse`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         required: false
 *         description: หน้าปัจจุบันของข้อมูล (ค่าเริ่มต้นคือ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         required: false
 *         description: จำนวนรายการต่อหน้า (ค่าเริ่มต้นคือ 10)
 *     responses:
 *       200:
 *         description: ดึงรายการสมาชิกสำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Get community members successfully
 *                 data:
 *                   type: array
 *                   description: รายชื่อสมาชิกในชุมชน
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john@example.com"
 *                       role:
 *                         type: string
 *                         example: "member"
 *                       joinedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-05T12:30:00Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 57
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: ไม่ได้ส่ง JWT Bearer token หรือ token ไม่ถูกต้อง (Unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       403:
 *         description: Forbidden – ผู้ใช้ไม่มีสิทธิ์ admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Forbidden resource
 *       500:
 *         description: Internal server error (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

accountRoutes.get(
  "/admin/communities/members",
  authMiddleware,
  allowRoles("admin"),
  getMemberByAdmin
);



export default accountRoutes;
