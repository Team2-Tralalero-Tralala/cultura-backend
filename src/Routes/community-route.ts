import { Router } from "express";
import {
  createCommunity,
  createCommunityDto,
  deleteCommunityById,
  editCommunity,
  editCommunityDto,
  deleteCommunityByIdDto,
} from "~/Controllers/community-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const communityRoutes = Router();

communityRoutes.post(
  "/",
  validateDto(createCommunityDto),
  authMiddleware,
  allowRoles("superadmin"),
  createCommunity
);
communityRoutes.put(
  "/:communityId",
  validateDto(editCommunityDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  editCommunity as any
);
communityRoutes.delete(
  "/:communityId",
  validateDto(deleteCommunityByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  deleteCommunityById as any
);
export default communityRoutes;
