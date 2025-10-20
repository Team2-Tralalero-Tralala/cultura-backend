// src/Routes/homestay-routes.ts
import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import { upload } from "~/Libs/uploadFile.js";

import {
    createHomestayDto,
    bulkCreateHomestayDto,
    editHomestayDto,
    createHomestay,
    createHomestaysBulk,
    getHomestayDetail,
    editHomestay,
} from "../Controllers/homestay-controller.js";

const homestayRoutes = Router();

/**
 * SuperAdmin only
 * - สร้างโฮมสเตย์เดี่ยว/หลายรายการใต้ community ที่กำหนด
 * - ดูรายการทั้งหมด (พร้อม filter ผ่าน query)
 * - ดูรายละเอียด/แก้ไขตาม id
 */

homestayRoutes.post(
    "/super/community/:communityId/homestay",
    authMiddleware,
    allowRoles("superadmin"),
    upload.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 10 },]),
    // validateDto(createHomestayDto),
    createHomestay
);

homestayRoutes.post(
    "/super/community/:communityId/homestay/bulk",
    authMiddleware,
    allowRoles("superadmin"),
    upload.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 10 },]),
    createHomestaysBulk
);

homestayRoutes.get(
    "/super/homestays/:homestayId",
    authMiddleware,
    allowRoles("superadmin"),
    getHomestayDetail
);

homestayRoutes.put(
    "/super/homestay/edit/:homestayId",
    authMiddleware,
    allowRoles("superadmin"),
    upload.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 10 },]),
    // validateDto(editHomestayDto),
    editHomestay
);

export default homestayRoutes;
