import { Router } from "express";
import authRoutes from "./auth-route.js";
import bookingHistoriesRoutes from "./booking-history-route.js";
import userRoutes from "./user-route.js";
import tagRoutes from "./tag-route.js";
import communityRoutes from "./community-route.js";
import packageRoutes from "./package-route.js";
import logRoutes from "./log-route.js";
import accountRoutes from "./account-routes.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/booking", bookingHistoriesRoutes);
rootRouter.use("/users", userRoutes);
rootRouter.use("/packages", packageRoutes);
rootRouter.use(communityRoutes);
rootRouter.use("/tags", tagRoutes);
rootRouter.use("/shared/logs", logRoutes);
rootRouter.use("/", accountRoutes);
export default rootRouter;
