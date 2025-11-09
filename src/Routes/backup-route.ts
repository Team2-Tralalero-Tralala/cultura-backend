import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import {
    createBackup,
    createBackupDto,
    deleteBackupById,
    deleteBackupByIdDto,
    deleteBackupsBulk,
    deleteBackupsBulkDto,
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
    validateDto(createBackupDto),
    authMiddleware, 
    allowRoles("superadmin"),
    createBackup
);

backupRoutes.delete(
    "/:backupId",
    validateDto(deleteBackupByIdDto),
    authMiddleware, 
    allowRoles("superadmin"),
    deleteBackupById
);

backupRoutes.post(
    "/delete-bulk",
    validateDto(deleteBackupsBulkDto),
    authMiddleware, 
    allowRoles("superadmin"),
    deleteBackupsBulk
);

export default backupRoutes;
