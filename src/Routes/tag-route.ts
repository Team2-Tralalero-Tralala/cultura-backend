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

tagRoutes.post(
    "/",
    validateDto(createTagDto),
    authMiddleware,
    allowRoles("superadmin"),
    createTag
);
tagRoutes.delete(
    "/:tagId",
    validateDto(deleteTagByIdDto),
    authMiddleware,
    allowRoles("superadmin"),
    deleteTagById
);
tagRoutes.put(
    "/:tagId",
    validateDto(editTagDto),
    authMiddleware,
    allowRoles("superadmin"),
    editTag
);
tagRoutes.get(
    "/shared/tags",
    getAllTags
);

export default tagRoutes;