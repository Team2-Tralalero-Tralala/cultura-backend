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
    changePassword,
    changePasswordDto,
} from "../Controllers/user-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const userRoutes = Router();

userRoutes.get(
    "/:userId",
    validateDto(getUserByIdDto),
    authMiddleware, allowRoles("superadmin", "admin", "member"),
    getUserById
);

userRoutes.get(
    "/status/:status",
    validateDto(getUserByStatusDto),
    authMiddleware, allowRoles("superadmin", "admin"),
    getUserByStatus
);

userRoutes.delete(
    "/:userId",
    validateDto(deleteAccountByIdDto),
    authMiddleware, allowRoles("superadmin", "admin"),
    deleteAccountById
);

userRoutes.put(
    "/block/:userId", 
    validateDto(blockAccountByIdDto),
    authMiddleware, allowRoles("superadmin", "admin"),
    blockAccountById
);

userRoutes.put(
    "/unblock/:userId",
    validateDto(unblockAccountByIdDto),
    authMiddleware, allowRoles("superadmin", "admin"),
    unblockAccountById
); 

userRoutes.post(
    "/change-password",
    authMiddleware,
    allowRoles("superadmin", "admin", "member", "tourist"),
    validateDto(changePasswordDto),
    changePassword
); 

export default userRoutes;
