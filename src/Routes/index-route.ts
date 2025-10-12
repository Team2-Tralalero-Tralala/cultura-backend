import { Router } from "express";
import authRoutes from "./auth-route.js";
import communityRoutes from "./community-route.js";
import logRoutes from "./log-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/communities", communityRoutes);
rootRouter.use("/shared/logs", logRoutes);

export default rootRouter;
