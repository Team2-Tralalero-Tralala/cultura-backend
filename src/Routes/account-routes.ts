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
accountRoutes.put(
  "/super/account/admin/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);
accountRoutes.put(
  "/super/account/member/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);
accountRoutes.put(
  "/super/account/tourist/:id",
  validateDto(editAccountDto),
  authMiddleware,
  allowRoles("superadmin"),
  editAccount
);

export default accountRoutes;