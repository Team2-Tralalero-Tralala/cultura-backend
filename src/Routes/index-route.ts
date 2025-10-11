import { Router } from "express";
import authRoutes from "./auth-route.js";
import userRoutes from "./user-route.js";
import bookingHistoryRoutes from "./booking-history-route.js";
import tagRoutes from "./tag-route.js";
import communityRoutes from "./community-route.js";
import logRoutes from "./log-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use(userRoutes);
rootRouter.use("/booking-histories", bookingHistoryRoutes);
rootRouter.use(communityRoutes);
rootRouter.use("/tags", tagRoutes);
rootRouter.use("/logs", logRoutes);

export default rootRouter;