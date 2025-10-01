
import { Router } from "express";
import { getCommunityById } from "../Controllers/community-controller.js";
import { getCommunityByMe } from "../Controllers/community-controller.js";
import { getCommunityAll } from "../Controllers/community-controller.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const communityRoutes = Router();
communityRoutes.get("/all", authMiddleware, allowRoles("superadmin"), getCommunityAll );
communityRoutes.get("/me", authMiddleware, allowRoles("admin","member"), getCommunityByMe );
communityRoutes.get("/:id", authMiddleware, getCommunityById );


export default communityRoutes;
