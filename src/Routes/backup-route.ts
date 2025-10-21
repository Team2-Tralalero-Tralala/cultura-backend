import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import {
    createBackup,
    createBackupDto,
    getBackupById,
    getBackupByIdDto,
    getBackups,
    getBackupsDto,
} from "../Controllers/backup-controller.js";

const backupRoutes = Router();

backupRoutes.get(
    "/",
    validateDto(getBackupsDto),
    authMiddleware, 
    allowRoles("superadmin"),
    getBackups
);

backupRoutes.get(
    "/:backupId",
    validateDto(getBackupByIdDto),
    authMiddleware, 
    allowRoles("superadmin"),
    getBackupById
);

backupRoutes.post(
    "/",
    authMiddleware, 
    allowRoles("superadmin"),
    createBackup
);

export default backupRoutes;
