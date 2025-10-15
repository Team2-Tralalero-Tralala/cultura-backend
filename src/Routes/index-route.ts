import { Router } from "express";
import authRoutes from "./auth-route.js";
import roleRoutes from "./role-route.js";
import packagesRoutes from "./package-route.js";

const rootRouter: Router = Router();


rootRouter.use("/auth", authRoutes);
rootRouter.use("/role", roleRoutes);
rootRouter.use(packagesRoutes);

export default rootRouter;
