import { Router } from "express";
import accountRoutes from "./account-routes.js";
import authRoutes from "./auth-route.js";
import roleRoutes from "./role-route.js";
const rootRouter = Router();
rootRouter.use(accountRoutes);        // รวมเส้นทางของ account
rootRouter.use("/auth", authRoutes);        // รวมเส้นทางของ auth
export default rootRouter;
