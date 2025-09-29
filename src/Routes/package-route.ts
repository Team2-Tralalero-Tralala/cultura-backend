import { Router } from "express";
import { createPackage, editPackage, deletePackage, getPackageByRole, createPackageDto, editPackageDto  } from "../Controllers/package-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware } from "~/Middlewares/auth-middleware.js";

const packageRoutes = Router();

// กำหนด endpoint ตามที่คุณออกแบบ
packageRoutes.post("/packagess", await validateDto(createPackageDto), createPackage);
packageRoutes.get("/packages/role", authMiddleware,getPackageByRole);
packageRoutes.put("/packages/:id", await validateDto(editPackageDto),editPackage);
packageRoutes.delete("/packages/:id", deletePackage);
export default packageRoutes;