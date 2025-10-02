import { Router } from "express";
import authRoutes from "./auth-route.js";
import roleRoutes from "./role-route.js";
import tagRoutes from "./tag-route.js";
import communityRoutes from "./community-route.js";
import logRoutes from "./log-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use(communityRoutes);
rootRouter.use("/role", roleRoutes);
rootRouter.use("/tags", tagRoutes);
rootRouter.use("/logs", logRoutes);

export default rootRouter;