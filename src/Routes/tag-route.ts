import { Router } from "express";
import {
  createTag,
  createTagDto,
  deleteTagById,
  deleteTagByIdDto,
  editTag,
  editTagDto,
  getAllTags,
} from "../Controllers/tag-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const tagRoutes = Router();

tagRoutes.post(
    "/tags",
    validateDto(createTagDto),
    authMiddleware,
    allowRoles("superadmin"),
    createTag
);
tagRoutes.delete(
    "/tags/:tagId",
    validateDto(deleteTagByIdDto),
    authMiddleware,
    allowRoles("superadmin"),
    deleteTagById
);
tagRoutes.put(
    "/tags/:tagId",
    validateDto(editTagDto),
    authMiddleware,
    allowRoles("superadmin"),
    editTag
);
tagRoutes.get(
    "/shared/tags",
    getAllTags
  "/super/tag",
  validateDto(createTagDto),
  authMiddleware,
  allowRoles("superadmin"),
  createTag
);
tagRoutes.delete(
  "/super/tag/:tagId",
  validateDto(deleteTagByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  deleteTagById
);
tagRoutes.put(
  "/super/tags/:tagId",
  validateDto(editTagDto),
  authMiddleware,
  allowRoles("superadmin"),
  editTag
);
tagRoutes.get("/shared/tags", getAllTags);

export default tagRoutes;
