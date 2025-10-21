import { Router } from "express";
import authRoutes from "./auth-route.js";
import backupRoutes from "./backup-route.js";
import bookingHistoriesRoutes from "./booking-history-route.js";
import communityRoutes from "./community-route.js";
import dashboardRoutes from "./dashboard-route.js";
import logRoutes from "./log-route.js";
import homestayRoutes from "./homestay-route.js";
import packageRoutes from "./package-route.js";
import accountRoutes from "./account-routes.js";
import packageRequestsRoutes from "./package-request-route.js"
import storeRoute from "./store-route.js";
import tagRoutes from "./tag-route.js";
import userRoutes from "./user-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/booking", bookingHistoriesRoutes);
rootRouter.use("/packages", packageRoutes);
rootRouter.use(userRoutes);
rootRouter.use(communityRoutes);
rootRouter.use(homestayRoutes);
rootRouter.use("/tags", tagRoutes);
rootRouter.use("/logs", logRoutes);

rootRouter.use("/shared/logs", logRoutes);
rootRouter.use("/", accountRoutes);
rootRouter.use(homestayRoutes)
rootRouter.use(packageRequestsRoutes);
rootRouter.use(storeRoute);
rootRouter.use("/super/backups", backupRoutes);
rootRouter.use("/super/dashboard", dashboardRoutes);

export default rootRouter;
