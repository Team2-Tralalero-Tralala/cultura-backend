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

/**
 * @swagger
 * /api/admin/package:
 *   post:
 *     tags: [Packages - Admin]
 *     summary: สร้างแพ็กเกจ (เฉพาะ Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePackageDto'
 *           examples:
 *             sample:
 *               value:
 *                 name: "ทริปชุมชน A"
 *                 description: "รายละเอียดกิจกรรม"
 *                 price: 1590
 *                 capacity: 20
 *                 communityId: 10
 *                 startDate: "2025-12-10T00:00:00.000Z"
 *                 dueDate: "2025-12-12T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             examples:
 *               created:
 *                 value:
 *                   status: true
 *                   message: "Create Package Success"
 *                   data:
 *                     id: 101
 *       400:
 *         description: ผิดพลาด (createErrorResponse)
 */

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

/**
 * @swagger
 * /api/admin/packages:
 *   get:
 *     tags: [Packages - Admin]
 *     summary: ดึงรายการแพ็กเกจ (เฉพาะ Admin)
 *     description: >
 *       คืนรายการแพ็กเกจพร้อมข้อมูล Pagination  
 *       **ต้องส่ง JWT Bearer token** และต้องมีสิทธิ์ `admin`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: เลขหน้า (เริ่มที่ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             examples:
 *               success:
 *                 summary: Get Admin Packages Success
 *                 value:
 *                   status: true
 *                   message: "Get Packages Success"
 *                   data:
 *                     data:
 *                       - id: 101
 *                         name: "แพ็กเกจชุมชน A"
 *                         description: "รายละเอียด..."
 *                         price: 1500
 *                         community: { id: 10, name: "ชุมชน A" }
 *                         overseerPackage:
 *                           id: 7
 *                           username: "memberA"
 *                           fname: "A"
 *                           lname: "B"
 *                           email: "memberA@example.com"
 *                       - id: 102
 *                         name: "แพ็กเกจชุมชน B"
 *                         description: "รายละเอียด..."
 *                         price: 1890
 *                         community: { id: 10, name: "ชุมชน A" }
 *                         overseerPackage: null
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 2
 *                       totalCount: 12
 *                       limit: 10
 *       401:
 *         description: ไม่ได้รับอนุญาต (ไม่มี/Token ไม่ถูกต้อง)
 *         content:
 *           application/json:
 *             examples:
 *               unauthorized:
 *                 value:
 *                   status: false
 *                   message: "Unauthorized"
 */

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

/**
 * @swagger
 * /api/admin/package/{id}:
 *   put:
 *     tags: [Packages - Admin]
 *     summary: แก้ไขแพ็กเกจตาม ID (เฉพาะ Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditPackageDto'
 *           examples:
 *             sample:
 *               value:
 *                 name: "ทริปชุมชน A (อัปเดต)"
 *                 price: 1790
 *                 capacity: 25
 *     responses:
 *       200:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             examples:
 *               updated:
 *                 value:
 *                   status: true
 *                   message: "Edit Package Success"
 *                   data: { id: 101 }
 *       400:
 *         description: ผิดพลาด (createErrorResponse)
 */


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

/**
 * @swagger
 * /api/admin/package/{id}:
 *   patch:
 *     tags: [Packages - Admin]
 *     summary: ลบ/ปิดการใช้งานแพ็กเกจตาม ID (เฉพาะ Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             examples:
 *               deleted:
 *                 value:
 *                   status: true
 *                   message: "Delete Package Success"
 *                   data: { id: 101 }
 *       400:
 *         description: ผิดพลาด (createErrorResponse)
 */

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

/**
 * @swagger
 * /api/super/package:
 *   post:
 *     tags: [Packages - SuperAdmin]
 *     summary: สร้างแพ็กเกจ (เฉพาะ SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePackageDto'
 *           examples:
 *             sample:
 *               value:
 *                 name: "ทริปพิเศษชุมชน X"
 *                 description: "รายละเอียด..."
 *                 price: 1990
 *                 capacity: 30
 *                 communityId: 11
 *                 startDate: "2025-12-20T00:00:00.000Z"
 *                 dueDate: "2025-12-22T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             examples:
 *               created:
 *                 value:
 *                   status: true
 *                   message: "Create Package Success"
 *                   data: { id: 1 }
 *       400:
 *         description: ผิดพลาด (createErrorResponse)
 */

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

/**
 * @swagger
 * /api/super/packages:
 *   get:
 *     tags: [Packages - SuperAdmin]
 *     summary: ดึงรายการแพ็กเกจทั้งหมด (เฉพาะ SuperAdmin)
 *     description: >
 *       คืนรายการแพ็กเกจทั้งหมดพร้อมข้อมูล Pagination  
 *       **ต้องส่ง JWT Bearer token** และต้องมีสิทธิ์ `superadmin`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: เลขหน้า (เริ่มที่ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             examples:
 *               success:
 *                 summary: Get Packages Success
 *                 value:
 *                   status: true
 *                   message: "Get Packages Success"
 *                   data:
 *                     data:
 *                       - id: 1
 *                         name: "แพ็กเกจ A"
 *                         description: "รายละเอียด..."
 *                         price: 1200
 *                         community: { id: 10, name: "ชุมชนตัวอย่าง" }
 *                         location:
 *                           detail: "123 หมู่ 1"
 *                           subDistrict: "บางรัก"
 *                           district: "บางรัก"
 *                           province: "กรุงเทพมหานคร"
 *                           latitude: 13.73
 *                           longitude: 100.52
 *                         overseerPackage:
 *                           id: 5
 *                           username: "member001"
 *                           fname: "Somchai"
 *                           lname: "Dee"
 *                           email: "member001@example.com"
 *                       - id: 2
 *                         name: "แพ็กเกจ B"
 *                         description: "รายละเอียด..."
 *                         price: 1990
 *                         community: { id: 11, name: "ชุมชน B" }
 *                         location: null
 *                         overseerPackage: { id: 6, username: "m002", fname: "A", lname: "B", email: "m002@example.com" }
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 3
 *                       totalCount: 25
 *                       limit: 10
 *       400:
 *         description: ผิดพลาด (createErrorResponse)
 *         content:
 *           application/json:
 *             examples:
 *               invalidUser:
 *                 summary: ตัวอย่าง error จาก service/validation
 *                 value:
 *                   status: false
 *                   message: "Member ID 999 ไม่ถูกต้อง"
 *       401:
 *         description: ไม่ได้รับอนุญาต (ไม่มี/Token ไม่ถูกต้อง)
 */

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

/**
 * @swagger
 * /api/super/package/{id}:
 *   put:
 *     tags: [Packages - SuperAdmin]
 *     summary: แก้ไขแพ็กเกจตาม ID (รองรับอัปโหลดรูป) (เฉพาะ SuperAdmin)
 *     description: >
 *       รับ `multipart/form-data` โดยส่ง **data** เป็น JSON string และไฟล์รูป  
 *       ฟิลด์ไฟล์: `cover` (สูงสุด 1), `gallery` (สูงสุด 5)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string ตาม EditPackageDto
 *                 example: |
 *                   {"name":"แพ็กเกจ X (แก้ไข)","price":2490,"capacity":40}
 *               cover:
 *                 type: string
 *                 format: binary
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *           encoding:
 *             data: { contentType: application/json }
 *     responses:
 *       200:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             examples:
 *               updated:
 *                 value:
 *                   status: true
 *                   message: "Edit Package Success"
 *                   data: { id: 1 }
 *       400:
 *         description: ผิดพลาด (createErrorResponse)
 */

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

/**
 * @swagger
 * /api/super/package/{id}:
 *   patch:
 *     tags: [Packages - SuperAdmin]
 *     summary: ลบ/ปิดการใช้งานแพ็กเกจตาม ID (เฉพาะ SuperAdmin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             examples:
 *               deleted:
 *                 value:
 *                   status: true
 *                   message: "Delete Package Success"
 *                   data: { id: 1 }
 *       400:
 *         description: ผิดพลาด (createErrorResponse)
 */

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
