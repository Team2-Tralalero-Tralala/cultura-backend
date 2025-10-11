import { Router } from "express";
import { createPackage, editPackage, deletePackage, getPackageByRole, getPackageById, createPackageDto, editPackageDto } from "../Controllers/package-controller.js";
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
packageRoutes.get("/admin/package/:id",
    authMiddleware,
    allowRoles("admin"),
    getPackageById
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
packageRoutes.get("/member/package/:id",
    authMiddleware,
    allowRoles("member"),
    getPackageById
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


packageRoutes.post("/super/package",
    authMiddleware,
    validateDto(createPackageDto),
    allowRoles("admin", "member"),
    createPackage
);
packageRoutes.get("/super/packages",
    authMiddleware,
    allowRoles("superadmin"),
    getPackageByRole
);
packageRoutes.get("/super/package/:id",
    authMiddleware,
    allowRoles("superadmin"),
    getPackageById
);
packageRoutes.put("/super/package/:id",
    authMiddleware,
    validateDto(editPackageDto),
    allowRoles("superadmin"),
    editPackage
);
packageRoutes.patch("/super/package/:id",
    authMiddleware,
    allowRoles("superadmin"),
    deletePackage
);
export default packageRoutes;