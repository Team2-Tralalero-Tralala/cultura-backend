/*
 * คำอธิบาย : Routes สำหรับ “คำขอแพ็กเกจ”
 * Base path : /api/super/package-requests
 * Access     : superadmin, admin
 */

import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import {
    getPackageRequestAll,
    getPackageRequestAllDto,
    patchApprovePackageRequest,
    patchRejectPackageRequest,
    patchRejectPackageRequestDto,
} from "~/Controllers/package-request-controller.js";

const packageRequestRoutes = Router();

/** DTO ภายในไฟล์สำหรับ approve (ตรวจ params ตาม CS) */
const patchApprovePackageRequestDto = {
    params: { packageId: "number" },
};

/**
 * ดึงรายการคำขอ (list)
 */
packageRequestRoutes.get(
    "/",
    validateDto(getPackageRequestAllDto),
    authMiddleware,
    allowRoles("superadmin", "admin"),
    getPackageRequestAll
);

/**
 * อนุมัติคำขอ
 */
packageRequestRoutes.patch(
    "/:packageId/approve",
    validateDto(patchApprovePackageRequestDto),
    authMiddleware,
    allowRoles("superadmin", "admin"),
    patchApprovePackageRequest
);

/**
 * ปฏิเสธคำขอ
 */
packageRequestRoutes.patch(
    "/:packageId/reject",
    validateDto(patchRejectPackageRequestDto),
    authMiddleware,
    allowRoles("superadmin", "admin"),
    patchRejectPackageRequest
);

export default packageRequestRoutes;
