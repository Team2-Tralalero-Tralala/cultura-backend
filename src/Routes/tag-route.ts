import { Router } from "express";
import {
    createTag,
    createTagDto,
    deleteTagById,
    deleteTagByIdDto,
    editTag,
    editTagDto,
    getAllTags
} from "../Controllers/tag-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const tagRoutes = Router();

/**
 * คำอธิบาย : route สำหรับสร้างประเภทหรือแท็ก
 */
tagRoutes.post(
    "/super/tag",
    validateDto(createTagDto),
    authMiddleware,
    allowRoles("superadmin"),
    createTag
);
/**
 * คำอธิบาย : route สำหรับลบประเภทหรือแท็ก
 */
tagRoutes.patch(
    "/super/tag/:tagId",
    validateDto(deleteTagByIdDto),
    authMiddleware,
    allowRoles("superadmin"),
    deleteTagById
);
/**
 * คำอธิบาย : route สำหรับแก้ไขประเภทหรือแท็ก
 */
tagRoutes.put(
    "/super/tag/:tagId",
    validateDto(editTagDto),
    authMiddleware,
    allowRoles("superadmin"),
    editTag
);
/**
 * คำอธิบาย : route สำหรับดึงข้อมูลประเภทหรือแท็กมาแสดงทั้งหมด
 */
tagRoutes.get(
    "/super/shared/tags",
    getAllTags
);

export default tagRoutes;