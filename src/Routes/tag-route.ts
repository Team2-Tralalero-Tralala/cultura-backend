import { Router } from "express";
import * as TagController from "../Controllers/tag-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const tagRoutes = Router();

/**
 * คำอธิบาย : route สำหรับสร้างประเภทหรือแท็ก
 */
tagRoutes.post(
    "/super/tag",
    validateDto(TagController.createTagDto),
    authMiddleware,
    allowRoles("superadmin"),
    TagController.createTag
);

/**
 * คำอธิบาย : route สำหรับลบประเภทหรือแท็ก
 */
tagRoutes.patch(
    "/super/tag/:tagId",
    validateDto(TagController.deleteTagByIdDto),
    authMiddleware,
    allowRoles("superadmin"),
    TagController.deleteTagById
);

/**
 * คำอธิบาย : route สำหรับแก้ไขประเภทหรือแท็ก
 */
tagRoutes.put(
    "/super/tag/:tagId",
    validateDto(TagController.editTagDto),
    authMiddleware,
    allowRoles("superadmin"),
    TagController.editTag
);

/**
 * คำอธิบาย : route สำหรับดึงข้อมูลประเภทหรือแท็กมาแสดงทั้งหมด
 */
tagRoutes.get(
    "/shared/tags",
    validateDto(TagController.getAllTagsDto),
    authMiddleware,
    allowRoles("superadmin"),
    TagController.getAllTags);

export default tagRoutes;
