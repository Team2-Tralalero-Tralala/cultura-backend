import { Router } from "express";
import authRoutes from "./auth-route.js";
import roleRoutes from "./role-route.js";
import tagRoutes from "./tag-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/role", roleRoutes);
rootRouter.use("/tag", tagRoutes);

export default rootRouter;
