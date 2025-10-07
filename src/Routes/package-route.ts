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


packageRoutes.post("/member/package", 
    authMiddleware, 
    validateDto(createPackageDto), 
    allowRoles("member"),
    createPackage
);
packageRoutes.get("/member/packages", 
    authMiddleware, 
    allowRoles("member"),
    getPackageByRole
);
packageRoutes.put("/member/package/:id", 
    authMiddleware, 
    validateDto(editPackageDto),
    allowRoles("member"),
    editPackage
);
packageRoutes.patch("/member/package/:id", 
    authMiddleware, 
    allowRoles("member"),
    deletePackage
);
export default packageRoutes;