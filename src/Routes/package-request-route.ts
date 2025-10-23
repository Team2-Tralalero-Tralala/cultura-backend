/*
 * คำอธิบาย : Routes สำหรับดึงรายการคำขอแพ็กเกจ (เฉพาะฟิลด์ที่จำเป็น)
 * Path : /api/super/package-requests
 * Access : superadmin, admin
 */

import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import {
    getPackageRequestAll,
    getPackageRequestAllDto,
    patchApprovePackageRequest,
    patchRejectPackageRequest,
    getDetailRequest,
} from "~/Controllers/package-request-controller.js";
const packageRequestRoutes = Router();

/**
 * ดึงรายการคำขอ (list)
 */
packageRequestRoutes.get(
    "/super/package-requests",
    authMiddleware,
    allowRoles("superadmin", "admin"),
    validateDto(getPackageRequestAllDto),
    getPackageRequestAll
);

/**
 * อนุมัติคำขอ
 */
packageRequestRoutes.patch(
    "/super/package-requests/:packageId/approve",
    authMiddleware,
    allowRoles("superadmin", "admin"),
    patchApprovePackageRequest
);

/**
 * ปฏิเสธคำขอ
 */
packageRequestRoutes.patch(
    "/super/package-requests/:packageId/reject",
    authMiddleware,
    allowRoles("superadmin", "admin"),
    patchRejectPackageRequest
);

packageRequestRoutes.get(
    "/super/package-requests/:requestId", 
    authMiddleware, 
    allowRoles("superadmin"), 
    getDetailRequest
);

export default packageRequestRoutes;
