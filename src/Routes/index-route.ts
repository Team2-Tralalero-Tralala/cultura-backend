import { Router } from "express";
import authRoutes from "./auth-route.js";
import roleRoutes from "./role-route.js";
import userRouter from "./user-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/role", roleRoutes);
rootRouter.use("/users", userRouter);

export default rootRouter;
