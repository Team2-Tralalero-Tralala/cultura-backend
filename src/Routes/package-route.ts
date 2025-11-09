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
    getHistoriesPackageAdmin,
    getPackageByRole,
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