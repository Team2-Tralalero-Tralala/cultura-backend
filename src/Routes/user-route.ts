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
    createAccountDto,
    createAccount,
} from "../Controllers/user-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import { compressUploadedFile } from "../Middlewares/upload-middleware.js";
import { upload } from "../Libs/uploadFile.js";

const userRoutes = Router();

//เทส API ใช้ฟังก์ชันบีบไฟล์
userRoutes.post(
    "/",
    upload.single("profileImage"),
    compressUploadedFile,
    validateDto(createAccountDto),
    createAccount
); 

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

export default userRoutes;
