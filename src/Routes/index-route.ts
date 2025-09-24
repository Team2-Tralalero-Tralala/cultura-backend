import { Router } from "express";
import authRoutes from "./auth-route.js";
import roleRoutes from "./role-route.js";
import communityRoutes from "./community-route.js";
import packageRoutes from "./package-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/role", roleRoutes);
rootRouter.use("/community", communityRoutes);

rootRouter.use("/package", packageRoutes);

export default rootRouter;
