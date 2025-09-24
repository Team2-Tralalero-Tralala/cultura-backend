
import { Router } from "express";
import { getCommunityById } from "../Controllers/community-controller.js";
import { getCommunityByRole } from "../Controllers/community-controller.js";

const communityRoutes = Router();
communityRoutes.get("/getCommunityById/:id", getCommunityById );
communityRoutes.get("/getCommunityByRole/:id", getCommunityByRole );
export default communityRoutes;
