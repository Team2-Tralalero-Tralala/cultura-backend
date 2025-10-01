import { Router } from "express";
import { createPackage, editPackage, deletePackage, getPackageByRole, createPackageDto, editPackageDto  } from "../Controllers/package-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const packageRoutes = Router();
// กำหนด endpoint ตามที่คุณออกแบบ
packageRoutes.post("/packages", 
    authMiddleware, 
    validateDto(createPackageDto), 
    allowRoles("admin", "member"),
    createPackage
);
packageRoutes.get("/packages", 
    authMiddleware, 
    allowRoles("superadmin", "admin", "member", "tourist"),
    getPackageByRole
);
packageRoutes.put("/packages/:id", 
    authMiddleware, 
    validateDto(editPackageDto),
    allowRoles("superadmin", "admin", "member"),
    editPackage
);
packageRoutes.delete("/packages/:id", 
    authMiddleware, 
    allowRoles("superadmin", "admin", "member"),
    deletePackage
);
export default packageRoutes;