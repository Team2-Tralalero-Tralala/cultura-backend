import { Router } from "express";
import authRoutes from "./auth-route.js";
import backupRoutes from "./backup-route.js";
import bookingHistoriesRoutes from "./booking-history-route.js";
import communityRoutes from "./community-route.js";
import configRoutes from "./config-route.js";
import dashboardRoutes from "./dashboard-route.js";
import logRoutes from "./log-route.js";
import homestayRoutes from "./homestay-route.js";
import packageRoutes from "./package-route.js";
import accountRoutes from "./account-routes.js";
import packageRequestsRoutes from "./package-request-route.js";
import storeRoute from "./store-route.js";
import tagRoutes from "./tag-route.js";
import userRoutes from "./user-route.js";
import bannerRoutes from "./banner-route.js";
import bankRoutes from "./bank-route.js";
import storeAdminRoutes  from "./storeAdmin-route.js";
import bookingRefund from "./booking-route.js"
import feedbackRoutes from "./feedback-routes.js";
import bookingRoutes from "./booking-history-route.js";
import storeSuperAdminRoutes from "./storeSuperAdmin-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/booking", bookingHistoriesRoutes);
rootRouter.use(packageRoutes);
rootRouter.use("/booking-histories", bookingHistoriesRoutes);
rootRouter.use("/packages", packageRoutes);
rootRouter.use(userRoutes);
rootRouter.use(communityRoutes);
rootRouter.use("/shared/logs", logRoutes);
rootRouter.use(homestayRoutes);
rootRouter.use(tagRoutes);
rootRouter.use("/logs", logRoutes);

rootRouter.use(configRoutes);
rootRouter.use("/shared/logs", logRoutes);
rootRouter.use(accountRoutes);
rootRouter.use(packageRequestsRoutes);
rootRouter.use(storeRoute);
rootRouter.use("/super/backups", backupRoutes);
rootRouter.use(dashboardRoutes);
rootRouter.use("/super/banner", bannerRoutes);
rootRouter.use(bankRoutes);
rootRouter.use("/admin/stores", storeAdminRoutes);
rootRouter.use("/super/stores", storeSuperAdminRoutes);
rootRouter.use(bookingRoutes);

rootRouter.use(bookingRefund);


rootRouter.use(feedbackRoutes);

export default rootRouter;
