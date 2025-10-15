import { Router } from "express";
import * as CommunityController from "~/Controllers/community-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const communityRoutes = Router();

communityRoutes.post(
  "/super/community",
  validateDto(CommunityController.createCommunityDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.createCommunity
);
communityRoutes.put(
  "/super/community/:communityId",
  validateDto(CommunityController.editCommunityDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  CommunityController.editCommunity
);
communityRoutes.patch(
  "/super/community/:communityId",
  validateDto(CommunityController.deleteCommunityByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.deleteCommunityById
);
communityRoutes.get(
  "/super/admins/unassigned",
  validateDto(CommunityController.unassignedAdminsDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getUnassignedAdmins
);

communityRoutes.get(
  "/super/members/unassigned",
  validateDto(CommunityController.unassignedMemberDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getUnassignedMembers
);
export default communityRoutes;
