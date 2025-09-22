import { Router } from "express";
import authRoutes from "./auth-route.js";
import roleRoutes from "./role-route.js";
import bookingHistoriesRoutes from "./bookingHistories-route.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/role", roleRoutes);
rootRouter.use("/booking-histories", bookingHistoriesRoutes);

export default rootRouter;
