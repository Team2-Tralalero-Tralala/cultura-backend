
import { Router } from "express";
import { getCommunityById } from "../Controllers/community-controller.js";
import { getCommunityByUserRole } from "../Controllers/community-controller.js";

const communityRoutes = Router();
communityRoutes.get("/communities/:id", getCommunityById );
communityRoutes.get("/communities/role/:id", getCommunityByUserRole );
export default communityRoutes;
