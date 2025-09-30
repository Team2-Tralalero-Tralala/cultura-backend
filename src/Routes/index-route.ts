import { Router } from "express";
import accountRoutes from "./account-routes.js";
import authRoutes from "./auth-route.js";
import roleRoutes from "./role-route.js";

const rootRouter = Router();

rootRouter.use(accountRoutes);
rootRouter.use("/auth", authRoutes);
rootRouter.use("/roles", roleRoutes);

export default rootRouter;
