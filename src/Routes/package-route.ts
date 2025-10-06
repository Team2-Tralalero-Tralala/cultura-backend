import { Router } from "express";
import { createPackage, editPackage, deletePackage, getPackageByRole, createPackageDto, editPackageDto  } from "../Controllers/package-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const packageRoutes = Router();
packageRoutes.post("/admin/package", 
    authMiddleware, 
    validateDto(createPackageDto), 
    allowRoles("admin"),
    createPackage
);
packageRoutes.get("/admin/packages", 
    authMiddleware, 
    allowRoles("admin"),
    getPackageByRole
);
packageRoutes.put("/admin/package/:id", 
    authMiddleware, 
    validateDto(editPackageDto),
    allowRoles("admin"),
    editPackage
);
packageRoutes.patch("/admin/package/:id", 
    authMiddleware, 
    allowRoles("admin"),
    deletePackage
);
export default packageRoutes;