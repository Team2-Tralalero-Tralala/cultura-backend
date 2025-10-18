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
  allowRoles("superadmin"),
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
  "/super/community/:communityId",
  validateDto(CommunityController.getCommunityByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getCommunityById
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

communityRoutes.get(
  "/admin/community",
  validateDto(CommunityController.getCommunityDetailByAdminDto),
  authMiddleware,
  allowRoles("admin"),
  CommunityController.getCommunityDetailByAdmin
);

communityRoutes.get(
  "/super/communities",
  validateDto(CommunityController.getCommunityAllDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getCommunityAll
);

communityRoutes.get(
  "/super/community/detail/:communityId",
  validateDto(CommunityController.getCommunityDetailByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getCommunityDetailById
);

export default communityRoutes;


