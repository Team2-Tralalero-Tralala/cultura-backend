import { authMiddleware, allowRoles } from "../Middlewares/auth-middleware.js"
import { Router } from "express";
import { getAllUSers } from "../Controllers/user-controller.js"

const userRouter: Router = Router();

userRouter.get("/", authMiddleware, allowRoles("superadmin"), getAllUSers);

export default userRouter;