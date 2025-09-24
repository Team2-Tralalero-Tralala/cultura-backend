
import { Router } from "express";
import { getCommunityId } from "../Controllers/community-controller.js";

const communityRoutes = Router();
communityRoutes.get("/getCommunityId/:id", getCommunityId);
export default communityRoutes;
