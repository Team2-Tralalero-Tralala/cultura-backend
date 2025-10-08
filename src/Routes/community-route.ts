import { Router } from "express";
import * as CommunityControler from "~/Controllers/community-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const communityRoutes = Router();

communityRoutes.post(
  "/super/community",
  validateDto(CommunityControler.createCommunityDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityControler.createCommunity
);
communityRoutes.put(
  "/super/community/:communityId",
  validateDto(CommunityControler.editCommunityDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  CommunityControler.editCommunity
);
communityRoutes.patch(
  "/super/community/:communityId",
  validateDto(CommunityControler.deleteCommunityByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityControler.deleteCommunityById
);

communityRoutes.get(
  "/super/communities",
  validateDto(CommunityControler.getCommunityAllDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityControler.getCommunityAll  
);
export default communityRoutes;
