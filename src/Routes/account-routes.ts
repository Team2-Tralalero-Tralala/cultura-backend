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
import { validateDto } from "../Libs/validateDto.js";
import { authMiddleware, allowRoles } from "../Middlewares/auth-middleware.js";

const accountRoutes = Router();

/**
 * @route GET /admin/communities/members
 * @description ดึงข้อมูลสมาชิกในชุมชนของตนเอง (เฉพาะ Admin)
 * @access Admin
*/
accountRoutes.get(
  "/admin/communities/members",
  authMiddleware,
  allowRoles("admin"),
  getMemberByAdmin
);

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
 * @route PUT /super/account/:id
 * @description แก้ไขข้อมูลบัญชีผู้ใช้ตาม ID (เฉพาะ SuperAdmin)
 * @access SuperAdmin
*/
accountRoutes.put(
  "/super/account/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);

/**
 * @route GET /super/account/users
 * @description ดึงข้อมูลผู้ใช้ทั้งหมดในระบบ (เฉพาะ SuperAdmin)
 * @access SuperAdmin
 */
accountRoutes.get(
  "/super/account/users",
  authMiddleware,
  allowRoles("superadmin"),
  getAll
);

/**
 * @route GET /super/account/:role/:id
 * @description ดึงข้อมูลผู้ใช้ตามบทบาท (Admin / Member / Tourist)
 * @access SuperAdmin
*/
accountRoutes.get(
  "/super/account/admin/:id",
  authMiddleware,
  allowRoles("superadmin"),
  getAccountById
);
accountRoutes.get(
  "/super/account/member/:id",
  authMiddleware,
  allowRoles("superadmin"),
  getAccountById
);
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


export default accountRoutes;