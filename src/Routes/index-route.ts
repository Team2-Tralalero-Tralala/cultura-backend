import { Router } from "express";
import authRoutes from "./auth-route.js";
import communityRoutes from "./community-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use(communityRoutes);

export default rootRouter;
