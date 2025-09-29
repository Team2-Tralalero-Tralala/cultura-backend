import { Router } from "express";
import authRoutes from "./auth-route.js";
import roleRoutes from "./role-route.js";
import packageRoutes from "./package-route.js";
import bookingHistoryRoutes from "./booking-history-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/role", roleRoutes);
rootRouter.use(packageRoutes);
rootRouter.use("/bookingHistory", bookingHistoryRoutes);

export default rootRouter;
