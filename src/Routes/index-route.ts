import { Router } from "express";
import accountRoutes from "./account-routes.js";

const rootRouter = Router();
rootRouter.use(accountRoutes);        // รวมเส้นทางของ account
export default rootRouter;
