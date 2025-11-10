// Routes/package-routes.ts
import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import {
    createPackageDto,
    editPackageDto,
    createPackageSuperAdmin,
    createPackageAdmin,
    createPackageMember,
    listPackagesSuperAdmin,
    listPackagesAdmin,
    listPackagesMember,
    listPackagesTourist,
    editPackageSuperAdmin,
    editPackageAdmin,
    editPackageMember,
    deletePackageSuperAdmin,
    deletePackageAdmin,
    deletePackageMember,
    getPackageDetail,
    listHomestaysByPackageDto,
    listHomestaysByPackage,
    getCommunityMembersDto,
    getCommunityMembers,
    listCommunityHomestaysDto,
    listCommunityHomestays,
    listAllHomestaysSuperAdmin,
    getAllFeedbacks,
    duplicatePackageHistoryDto,
    duplicatePackageHistoryAdmin,
    getPackageHistoryDetailAdmin,
    getHistoriesPackageAdmin,
    getPackageById
} from "../Controllers/package-controller.js";
import { upload } from "~/Libs/uploadFile.js";

const packageRoutes = Router();

/*
 * คำอธิบาย : (Member) Route สำหรับสร้างแพ็กเกจใหม่
 * Method : POST
 * Path : /member/package
 */
packageRoutes.post(
    "/member/package",
    authMiddleware,
    allowRoles("member"),
    validateDto(createPackageDto),
    createPackageMember
);

/*
 * คำอธิบาย : (Member) Route สำหรับดึงรายการแพ็กเกจ (ของตนเอง)
 * Method : GET
 * Path : /member/packages
 */
packageRoutes.get(
    "/member/packages",
    authMiddleware,
    allowRoles("member"),
    listPackagesMember
);

/*
 * คำอธิบาย : (Member) Routeสำหรับแก้ไขข้อมูลแพ็กเกจ
 * Method : PUT
 * Path : /member/package/:id
 */
packageRoutes.put(
    "/member/package/:id",
    authMiddleware,
    allowRoles("member"),
    validateDto(editPackageDto),
    editPackageMember
);

/*
 * คำอธิบาย : (Member) Route สำหรับลบแพ็กเกจ (Soft Delete)
 * Method : PATCH
 * Path : /member/package/:id
 */
packageRoutes.patch(
    "/member/package/:id",
    authMiddleware,
    allowRoles("member"),
    deletePackageMember
);

/*
 * คำอธิบาย : (Admin) Route สำหรับสร้างแพ็กเกจใหม่
 * Method : POST
 * Path : /admin/package
 */
packageRoutes.post(
    "/admin/package",
    authMiddleware,
    allowRoles("admin"),
    validateDto(createPackageDto),
    createPackageAdmin
);

/*
 * คำอธิบาย : (Admin) Route สำหรับคัดลอกแพ็กเกจจากประวัติ แล้วสร้างเป็นฉบับร่าง
 * Method : POST
 * Path : /admin/package/history/:packageId/duplicate
 */
packageRoutes.post(
    "/admin/package/history/:packageId/duplicate",
    authMiddleware,
    allowRoles("admin"),
    validateDto(duplicatePackageHistoryDto),
    duplicatePackageHistoryAdmin
);

/*
 * คำอธิบาย : (Admin) Route สำหรับดึงรายการแพ็กเกจ (ในชุมชนของตน)
 * Method : GET
 * Path : /admin/packages
 */
packageRoutes.get(
    "/admin/packages",
    authMiddleware,
    allowRoles("admin"),
    listPackagesAdmin
);

/*
 * คำอธิบาย : (Admin) Route สำหรับแก้ไขข้อมูลแพ็กเกจ
 * Method : PUT
 * Path : /admin/package/:id
 */
packageRoutes.put(
    "/admin/package/:id",
    authMiddleware,
    allowRoles("admin"),
    validateDto(editPackageDto),
    editPackageAdmin
);

/*
 * คำอธิบาย : (Admin) Route สำหรับลบแพ็กเกจ (Soft Delete)
 * Method : PATCH
 * Path : /admin/package/:id
 */
packageRoutes.patch(
    "/admin/package/:id",
    authMiddleware,
    allowRoles("admin"),
    deletePackageAdmin
);

/*
 * คำอธิบาย : (SuperAdmin) Route สำหรับสร้างแพ็กเกจใหม่
 * Method : POST
 * Path : /super/package
 */
packageRoutes.post(
    "/super/package",
    authMiddleware,
    allowRoles("superadmin"),
    validateDto(createPackageDto),
    createPackageSuperAdmin
);

/*
 * คำอธิบาย : (SuperAdmin) Route สำหรับดึงรายการแพ็กเกจทั้งหมด
 * Method : GET
 * Path : /super/packages
 */
packageRoutes.get(
    "/super/packages",
    authMiddleware,
    allowRoles("superadmin"),
    listPackagesSuperAdmin
);
packageRoutes.get(
  "/:id",
  authMiddleware,
  allowRoles("superadmin", "admin", "member", "tourist"),
  getPackageById
);

/*
 * คำอธิบาย : (SuperAdmin) Route สำหรับแก้ไขข้อมูลแพ็กเกจ (รองรับไฟล์)
 * Method : PUT
 * Path : /super/package/:id
 */
packageRoutes.put(
    "/super/package/:id",
    authMiddleware,
    allowRoles("superadmin"),
    upload.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 5 },]),
    // validateDto(editPackageDto),
    editPackageSuperAdmin
);

/*
 * คำอธิบาย : (SuperAdmin) Route สำหรับลบแพ็กเกจ (Soft Delete)
 * Method : PATCH
 * Path : /super/package/:id
 */
packageRoutes.patch(
    "/super/package/:id",
    authMiddleware,
    allowRoles("superadmin"),
    deletePackageSuperAdmin
);

/*
 * คำอธิบาย : (Tourist) Route สำหรับดึงรายการแพ็กเกจ (ที่เผยแพร่แล้ว)
 * Method : GET
 * Path : /tourist/packages
 */
packageRoutes.get(
    "/tourist/packages",
    authMiddleware,
    allowRoles("tourist"),
    listPackagesTourist
);

/*
 * คำอธิบาย : (Member) Route สำหรับดึงข้อมูลแพ็กเกจ 1 รายการ
 * Method : GET
 * Path : /member/package/:id
 */
packageRoutes.get(
    "/member/package/:id",
    authMiddleware,
    allowRoles("member"),
    getPackageDetail
);

/*
 * คำอธิบาย : (Admin) Route สำหรับดึงข้อมูลแพ็กเกจ 1 รายการ
 * Method : GET
 * Path : /admin/package/:id
 */
packageRoutes.get(
    "/admin/package/:id",
    authMiddleware,
    allowRoles("admin"),
    getPackageDetail
);

/**
 * @swagger
 * /api/packages/{id}:
 *   get:
 *     summary: Get package detail (SuperAdmin only)
 *     description: ดึงรายละเอียดของแพ็กเกจตาม ID (ต้องเป็น SuperAdmin เท่านั้น)
 *     tags:
 *       - Package
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Package ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with package detail
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
 *                   example: "Get package detail successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PackageDetail'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not a superadmin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/*
 * คำอธิบาย : (SuperAdmin) Route สำหรับดึงข้อมูลแพ็กเกจ 1 รายการ
 * Method : GET
 * Path : /super/package/:id
 */
packageRoutes.get(
    "/super/package/:id",
    authMiddleware,
    allowRoles("superadmin"),
    getPackageDetail
);

/*
 * คำอธิบาย : (Tourist) Route สำหรับดึงข้อมูลแพ็กเกจ 1 รายการ
 * Method : GET
 * Path : /tourist/package/:id
 */
packageRoutes.get(
    "/tourist/package/:id",
    authMiddleware,
    allowRoles("tourist"),
    getPackageDetail
);

/*
 * คำอธิบาย : (SuperAdmin) Route สำหรับดึงรายการที่พัก (เพื่อใช้เลือก)
 * ที่อยู่ในชุมชนเดียวกับแพ็กเกจ
 * Method : GET
 * Path : /super/homestay-select/:id
 */
packageRoutes.get(
    "/super/homestay-select/:id",
    validateDto(listHomestaysByPackageDto),
    authMiddleware,
    allowRoles("superadmin"),
    listHomestaysByPackage
);

/*
 * คำอธิบาย : (SuperAdmin) Route สำหรับดึงรายการที่พักทั้งหมดในระบบ
 * Method : GET
 * Path : /super/list-homestays
 */
packageRoutes.get(
    "/super/list-homestays",
    validateDto(listCommunityHomestaysDto),
    authMiddleware,
    allowRoles("superadmin"),
    listAllHomestaysSuperAdmin
);

/*
 * คำอธิบาย : (SuperAdmin) Route สำหรับดึงรายชื่อสมาชิก/แอดมินในชุมชน
 * Method : GET
 * Path : /super/community/:communityId/members
 */
packageRoutes.get(
    "/super/community/:communityId/members",
    validateDto(getCommunityMembersDto),
    authMiddleware,
    allowRoles("superadmin"),
    getCommunityMembers
);

/*
 * คำอธิบาย : (Member) Route สำหรับดึงรายการที่พัก (ในชุมชนของตนเอง)
 * Method : GET
 * Path : /member/list-homestays
 */
packageRoutes.get(
    "/member/list-homestays",
    validateDto(listCommunityHomestaysDto),
    authMiddleware,
    allowRoles("member"),
    listCommunityHomestays
);

/*
 * คำอธิบาย : (Admin) Route สำหรับดึงรายการ Feedback ทั้งหมดของแพ็กเกจ
 * Method : GET
 * Path : /admin/package/feedbacks/all
 * Middleware : authMiddleware → allowRoles("admin", "member")
 * Controller : getAllFeedbacks
 */
packageRoutes.get(
    "/admin/package/feedbacks/all",
    authMiddleware,
    allowRoles("admin", "member"),
    getAllFeedbacks
);

/**
 * @swagger
 * /api/admin/package/history/{packageId}:
 *   get:
 *     summary: Get package history detail (Admin only)
 *     description: ดึงข้อมูลรายละเอียดประวัติของแพ็กเกจตามรหัส (สำหรับผู้ดูแลระดับ Admin เท่านั้น)
 *     tags:
 *       - Package (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         description: รหัสของแพ็กเกจที่ต้องการดูประวัติ
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: ดึงข้อมูลประวัติของแพ็กเกจสำเร็จ
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
 *                   example: "Get package history detail successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "แพ็กเกจท่องเที่ยวบ้านหนองรี"
 *                     version:
 *                       type: integer
 *                       example: 3
 *                     updatedBy:
 *                       type: string
 *                       example: "Admin1"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-10T09:30:00.000Z"
 *                     changes:
 *                       type: array
 *                       description: รายการรายละเอียดการเปลี่ยนแปลงของแพ็กเกจ
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                             example: "description"
 *                           oldValue:
 *                             type: string
 *                             example: "รายละเอียดเก่า"
 *                           newValue:
 *                             type: string
 *                             example: "รายละเอียดใหม่"
 *       400:
 *         description: Bad Request (invalid packageId or error occurred)
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
 *         description: Package not found or no history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/*
 * คำอธิบาย : (Admin) Route สำหรับดูรายละเอียดประวัติแพ็กเกจ
 * Method : GET
 * Path : /api/admin/package/history/:packageId
 */
packageRoutes.get(
  "/admin/package/history/:packageId",
  authMiddleware,
  allowRoles("admin"),
  getPackageHistoryDetailAdmin
);

/**
 * @swagger
 * /api/admin/package/histories/all:
 *   get:
 *     summary: ดึงรายการประวัติแพ็กเกจที่สิ้นสุดแล้ว (สำหรับผู้ดูแลระบบ)
 *     description: |
 *       ใช้สำหรับดึงข้อมูล "แพ็กเกจที่หมดอายุ" ทั้งหมดในชุมชนที่ผู้ดูแลระบบรับผิดชอบ  
 *       ข้อมูลนี้จะรวมถึงสถานะการอนุมัติ, วันที่สิ้นสุด, และข้อมูลชุมชนที่เกี่ยวข้อง
 *     tags: [Admin - Package]
 *     security:
 *       - bearerAuth: []    # ใช้ JWT สำหรับ Authentication
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าที่ต้องการ (เริ่มจาก 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: ดึงรายการประวัติแพ็กเกจสำเร็จ
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
 *                   example: Get History Packages Success
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
 *                             example: "Eco Adventure Package"
 *                           community:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 3
 *                               name:
 *                                 type: string
 *                                 example: "ชุมชนบ้านแม่กำปอง"
 *                           overseerPackage:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 8
 *                               fname:
 *                                 type: string
 *                                 example: "สมชาย"
 *                               lname:
 *                                 type: string
 *                                 example: "ใจดี"
 *                           statusPackage:
 *                             type: string
 *                             example: "EXPIRED"
 *                           statusApprove:
 *                             type: string
 *                             example: "APPROVED"
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-30T23:59:59Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalCount:
 *                           type: integer
 *                           example: 42
 *                         limit:
 *                           type: integer
 *                           example: 10
 *       400:
 *         description: Bad Request — การดึงข้อมูลล้มเหลว หรือ Parameter ไม่ถูกต้อง
 *       401:
 *         description: Unauthorized — ไม่ได้เข้าสู่ระบบ
 *       403:
 *         description: Forbidden — ต้องเป็นผู้ดูแลระบบเท่านั้น
 *       500:
 *         description: Internal Server Error
 */

/*
 * คำอธิบาย : (Admin) Route สำหรับดึงรายการประวัติแพ็กเกจที่จบไปแล้ว (ในชุมชนของตน)
 * Method : GET
 * Path : /admin/package/histories/all
 */
packageRoutes.get(
    "/admin/package/histories/all",
    authMiddleware,
    allowRoles("admin"),
    getHistoriesPackageAdmin
);

export default packageRoutes;
