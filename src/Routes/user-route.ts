import { Router } from "express";
import { 
    getUserById,
    getUserByIdDto,
    getUserByStatus, 
    getUserByStatusDto,
    deleteAccountById,
    deleteAccountByIdDto,
    blockAccountById,
    blockAccountByIdDto,
    unblockAccountById,
    unblockAccountByIdDto,
} from "../Controllers/user-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const userRoutes = Router();

userRoutes.get(
    "/:id",
    validateDto(getUserByIdDto),
    authMiddleware, allowRoles("superadmin", "admin", "member", "tourist"),
    getUserById
);

userRoutes.get(
    "/status/:status",
    validateDto(getUserByStatusDto),
    authMiddleware, allowRoles("superadmin", "admin", "member"),
    getUserByStatus as any
);

userRoutes.delete(
    "/:id",
    validateDto(deleteAccountByIdDto),
    authMiddleware, allowRoles("superadmin", "admin"),
    deleteAccountById as any
);

userRoutes.put(
    "/block/:id", 
    validateDto(blockAccountByIdDto),
    authMiddleware, allowRoles("superadmin", "admin"),
    blockAccountById
);

userRoutes.put(
    "/unblock/:id",
    validateDto(unblockAccountByIdDto),
    authMiddleware, allowRoles("superadmin", "admin"),
    unblockAccountById
); 

export default userRoutes;