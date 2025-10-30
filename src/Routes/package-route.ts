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
} from "../Controllers/package-controller.js";
import { upload } from "~/Libs/uploadFile.js";

const packageRoutes = Router();

packageRoutes.post(
    "/member/package",
    authMiddleware,
    allowRoles("member"),
    validateDto(createPackageDto),
    createPackageMember
);
packageRoutes.get(
    "/member/packages",
    authMiddleware,
    allowRoles("member"),
    listPackagesMember
);
packageRoutes.put(
    "/member/package/:id",
    authMiddleware,
    allowRoles("member"),
    validateDto(editPackageDto),
    editPackageMember
);
packageRoutes.patch(
    "/member/package/:id",
    authMiddleware,
    allowRoles("member"),
    deletePackageMember
);

packageRoutes.post(
    "/admin/package",
    authMiddleware,
    allowRoles("admin"),
    validateDto(createPackageDto),
    createPackageAdmin
);
packageRoutes.get(
    "/admin/packages",
    authMiddleware,
    allowRoles("admin"),
    listPackagesAdmin
);
packageRoutes.put(
    "/admin/package/:id",
    authMiddleware,
    allowRoles("admin"),
    validateDto(editPackageDto),
    editPackageAdmin
);
packageRoutes.patch(
    "/admin/package/:id",
    authMiddleware,
    allowRoles("admin"),
    deletePackageAdmin
);

packageRoutes.post(
    "/super/package",
    authMiddleware,
    allowRoles("superadmin"),
    validateDto(createPackageDto),
    createPackageSuperAdmin
);
packageRoutes.get(
    "/super/packages",
    authMiddleware,
    allowRoles("superadmin"),
    listPackagesSuperAdmin
);
packageRoutes.put(
    "/super/package/:id",
    authMiddleware,
    allowRoles("superadmin"),
    upload.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 5 },]),
    // validateDto(editPackageDto),
    editPackageSuperAdmin
);
packageRoutes.patch(
    "/super/package/:id",
    authMiddleware,
    allowRoles("superadmin"),
    deletePackageSuperAdmin
);

packageRoutes.get(
    "/tourist/packages",
    authMiddleware,
    allowRoles("tourist"),
    listPackagesTourist
);

// MEMBER
packageRoutes.get(
    "/member/package/:id",
    authMiddleware,
    allowRoles("member"),
    getPackageDetail
);

// ADMIN
packageRoutes.get(
    "/admin/package/:id",
    authMiddleware,
    allowRoles("admin"),
    getPackageDetail
);

// SUPERADMIN
packageRoutes.get(
    "/super/package/:id",
    authMiddleware,
    allowRoles("superadmin"),
    getPackageDetail
);

// TOURIST
packageRoutes.get(
    "/tourist/package/:id",
    authMiddleware,
    allowRoles("tourist"),
    getPackageDetail
);

packageRoutes.get(
    "/super/homestay-select/:id",
    validateDto(listHomestaysByPackageDto),
    authMiddleware,
    allowRoles("superadmin"),
    listHomestaysByPackage
);

packageRoutes.get(
    "/super/list-homestays",
    validateDto(listCommunityHomestaysDto),
    authMiddleware,
    allowRoles("superadmin"),
    listAllHomestaysSuperAdmin
);

packageRoutes.get(
    "/super/community/:communityId/members",
    validateDto(getCommunityMembersDto),
    authMiddleware,
    allowRoles("superadmin"),
    getCommunityMembers
);

packageRoutes.get(
    "/member/list-homestays",
    validateDto(listCommunityHomestaysDto),
    authMiddleware,
    allowRoles("member"),
    listCommunityHomestays
);
export default packageRoutes;