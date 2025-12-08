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
    getPackageById,
} from "../Controllers/package-controller.js";
import * as PackageController from "../Controllers/package-controller.js";
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
    upload.fields([
        { name: "cover", maxCount: 1 },
        { name: "gallery", maxCount: 5 },
        { name: "video", maxCount: 5 },
    ]),
    // validateDto(createPackageDto),
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
    upload.fields([
        { name: "cover", maxCount: 1 },
        { name: "gallery", maxCount: 5 },
        { name: "video", maxCount: 5 },
    ]),
    // validateDto(editPackageDto),
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
    upload.fields([
        { name: "cover", maxCount: 1 },
        { name: "gallery", maxCount: 5 },
        { name: "video", maxCount: 5 },
    ]),
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
    upload.fields([
        { name: "cover", maxCount: 1 },
        { name: "gallery", maxCount: 5 },
        { name: "video", maxCount: 5 }
    ]),
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
    upload.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 5 }, { name: "video", maxCount: 5 },]),
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

/**
 * @swagger
 * /api/super/homestay-select/{id}:
 *   get:
 *     tags: [Homestays - SuperAdmin]
 *     summary: ดึงรายการที่พักที่อยู่ในชุมชนเดียวกับ "แพ็กเกจ" ที่ระบุ (เฉพาะ SuperAdmin)
 *     description: >
 *       คืนรายการ **Homestays** ตามชุมชนของแพ็กเกจ `id` ที่ระบุ  
 *       **ต้องส่ง JWT Bearer token** และต้องมีสิทธิ์ `superadmin`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Package ID
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: ค้นหาชื่อที่พัก (partial, case-insensitive)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 8
 *         description: จำนวนรายการ (1–50)
 *     responses:
 *       200:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: boolean, example: true }
 *                 message: { type: string, example: "fetch homestays successfully" }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 101 }
 *                       name: { type: string, example: "โฮมสเตย์ริมน้ำ" }
 *                       facility: { type: string, example: "แอร์, น้ำอุ่น, Wi-Fi" }
 *                       homestayImage:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             image: { type: string, example: "/uploads/homestays/cover-101.jpg" }
 *             examples:
 *               success:
 *                 value:
 *                   status: true
 *                   message: "fetch homestays successfully"
 *                   data:
 *                     - id: 101
 *                       name: "โฮมสเตย์ริมน้ำ"
 *                       facility: "แอร์, น้ำอุ่น, Wi-Fi"
 *                       homestayImage: [{ image: "/uploads/homestays/cover-101.jpg" }]
 *                     - id: 102
 *                       name: "บ้านพักสุขใจ"
 *                       facility: "พัดลม, จักรยานให้ยืม"
 *                       homestayImage: []
 *       400:
 *         description: คำขอไม่ถูกต้อง / ตรวจสอบไม่ผ่าน (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId: { value: { status: false, message: "Invalid packageId" } }
 *               notFound: { value: { status: false, message: "Package not found" } }
 *       401:
 *         description: ไม่ได้รับอนุญาต (ไม่มี/Token ไม่ถูกต้อง)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น superadmin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

/**
 * @swagger
 * /api/super/list-homestays:
 *   get:
 *     tags: [Homestays - SuperAdmin]
 *     summary: ดึงรายการที่พักทั้งหมด (เฉพาะ SuperAdmin)
 *     description: |
 *       คืนรายการ **Homestay** ทุกแห่งในระบบ พร้อมข้อมูลชุมชนและรูปหน้าปก (ถ้ามี)  
 *       **ต้องส่ง JWT Bearer token** และต้องมีสิทธิ์ `superadmin`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: คำค้นหาชื่อที่พัก (case-insensitive, partial match)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 8
 *         description: จำนวนรายการสูงสุดที่ต้องการ (1–50)
 *     responses:
 *       200:
 *         description: สำเร็จ (createResponse)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Fetch all homestays successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       name:
 *                         type: string
 *                         example: "บ้านพักสุขใจ"
 *                       facility:
 *                         type: string
 *                         example: "แอร์, น้ำอุ่น, Wi-Fi"
 *                       homestayImage:
 *                         type: array
 *                         description: แสดงเฉพาะภาพประเภท COVER (ถ้ามี) สูงสุด 1 รายการ
 *                         items:
 *                           type: object
 *                           properties:
 *                             image:
 *                               type: string
 *                               example: "/uploads/homestays/cover-12.jpg"
 *                       community:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 3
 *                           name:
 *                             type: string
 *                             example: "ชุมชนบางกะเจ้า"
 *             examples:
 *               success:
 *                 summary: ตัวอย่างข้อมูลสำเร็จ
 *                 value:
 *                   status: true
 *                   message: "Fetch all homestays successfully"
 *                   data:
 *                     - id: 12
 *                       name: "บ้านพักสุขใจ"
 *                       facility: "แอร์, น้ำอุ่น, Wi-Fi"
 *                       homestayImage: [{ image: "/uploads/homestays/cover-12.jpg" }]
 *                       community: { id: 3, name: "ชุมชนบางกะเจ้า" }
 *                     - id: 18
 *                       name: "โฮมสเตย์ริมน้ำ"
 *                       facility: "พัดลม, จักรยานให้ยืม"
 *                       homestayImage: []
 *                       community: { id: 5, name: "ชุมชนเกาะยอ" }
 *       400:
 *         description: คำขอไม่ถูกต้อง (createErrorResponse)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidLimit:
 *                 value: { status: false, message: "limit ต้องอยู่ระหว่าง 1 ถึง 50" }
 *       401:
 *         description: ไม่ได้รับอนุญาต (ไม่มี/Token ไม่ถูกต้อง)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น superadmin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

packageRoutes.get(
    "/admin/list-homestays",
    validateDto(listCommunityHomestaysDto),
    authMiddleware,
    allowRoles("admin"),
    listCommunityHomestays
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
    allowRoles("superadmin", "admin"),
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
    PackageController.getHistoriesPackageAdmin
);

/**
 * @swagger
 * /api/member/packages/histories/all:
 *   get:
 *     summary: ดึงรายการประวัติแพ็กเกจที่สิ้นสุดแล้ว (สำหรับสมาชิก)
 *     description: |
 *       ใช้สำหรับดึงข้อมูล "แพ็กเกจที่หมดอายุ" ทั้งหมดในชุมชนที่สมาชิกสังกัด
 *       ข้อมูลนี้จะรวมถึงสถานะการอนุมัติ, วันที่สิ้นสุด, และข้อมูลชุมชนที่เกี่ยวข้อง
 *     tags: [Member - Package]
 *     security:
 *       - bearerAuth: []
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
 *         description: Forbidden — ต้องเป็นสมาชิกเท่านั้น
 *       500:
 *         description: Internal Server Error
 */


/*
 * คำอธิบาย : (Member) Route สำหรับดึงรายการประวัติแพ็กเกจที่จบไปแล้ว (ในชุมชนของตน)
 * Method : GET
 * Path : /member/packages/histories/all
 */
packageRoutes.get(
    "/member/packages/histories/all",
    authMiddleware,
    allowRoles("member"),
    PackageController.getHistoriesPackageByMember
);

export default packageRoutes;
