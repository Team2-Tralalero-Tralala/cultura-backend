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
  "/communities/",
  validateDto(createCommunityDto),
  authMiddleware,
  allowRoles("superadmin"),
  createCommunity
);
communityRoutes.put(
  "/communities/:communityId",
  validateDto(editCommunityDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  editCommunity
);
communityRoutes.delete(
  "/communities/:communityId",
  validateDto(deleteCommunityByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  deleteCommunityById
);
export default communityRoutes;
