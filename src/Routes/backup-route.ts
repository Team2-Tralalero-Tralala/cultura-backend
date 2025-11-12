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

/**
 * @swagger
 * tags:
 *   - name: Backups (Super)
 *     description: Super Admin backup management
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     StandardSuccess:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 200
 *         error:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: OK
 *         data:
 *           nullable: true
 *     StandardError:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 400
 *         error:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Bad Request
 *         data:
 *           nullable: true
 *         errorId:
 *           type: string
 *           example: "de305d54-75b4-431b-adb2-eb6b9e546014"
 *         errors:
 *           nullable: true
 *
 *     BackupInfo:
 *       type: object
 *       properties:
 *         filename:
 *           type: string
 *           example: "Backup-Cultura-11-11-2025-10-25-40.zip"
 *         size:
 *           type: string
 *           example: "25.7 MB"
 *         status:
 *           type: string
 *           example: "completed"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-11T10:25:40.000Z"
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 3
 *         totalCount:
 *           type: integer
 *           example: 25
 *         limit:
 *           type: integer
 *           example: 10
 *
 *     BackupListData:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BackupInfo'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *
 *     BackupListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StandardSuccess'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/BackupListData'
 *
 *     CreateBackupResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StandardSuccess'
 *         - type: object
 *           properties:
 *             status:
 *               type: integer
 *               example: 201
 *             message:
 *               type: string
 *               example: "Backup created successfully"
 *             data:
 *               $ref: '#/components/schemas/BackupInfo'
 *
 *     DeleteOneResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StandardSuccess'
 *         - type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Backup file Backup-Cultura-11-11-2025-10-25-40.zip deleted successfully"
 *             data:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Backup file Backup-Cultura-11-11-2025-10-25-40.zip deleted successfully"
 *
 *     DeleteBulkRequest:
 *       type: object
 *       required: [ids]
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - "Backup-Cultura-11-11-2025-10-25-40.zip"
 *             - "Backup-Cultura-10-11-2025-11-00-00.zip"
 *
 *     DeleteBulkResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StandardSuccess'
 *         - type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Successfully deleted 2 backup file(s)"
 *             data:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully deleted 2 backup file(s), 0 failed"
 *                 deletedCount:
 *                   type: integer
 *                   example: 2
 *                 failedDeletions:
 *                   type: array
 *                   items:
 *                     type: string
 *
 * paths:
 *   /api/super/backups:
 *     get:
 *       tags: [Backups (Super)]
 *       summary: List backups (paginated)
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             minimum: 1
 *             default: 1
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 10
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           description: Filter by filename (contains)
 *       responses:
 *         200:
 *           description: Backups retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/BackupListResponse'
 *         401:
 *           description: Unauthorized
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         403:
 *           description: Forbidden
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         400:
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *
 *     post:
 *       tags: [Backups (Super)]
 *       summary: Create a new backup
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: false
 *       responses:
 *         201:
 *           description: Backup created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/CreateBackupResponse'
 *         401:
 *           description: Unauthorized
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         403:
 *           description: Forbidden
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         400:
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *
 *   /api/super/backups/{backupId}:
 *     get:
 *       tags: [Backups (Super)]
 *       summary: Download a backup file by filename
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: backupId
 *           required: true
 *           schema:
 *             type: string
 *           description: Backup filename including .zip (e.g., Backup-Cultura-11-11-2025-10-25-40.zip)
 *       responses:
 *         200:
 *           description: Backup file
 *           content:
 *             application/zip:
 *               schema:
 *                 type: string
 *                 format: binary
 *         401:
 *           description: Unauthorized
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         403:
 *           description: Forbidden
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         404:
 *           description: Not Found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         400:
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *
 *     delete:
 *       tags: [Backups (Super)]
 *       summary: Delete one backup by filename
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: backupId
 *           required: true
 *           schema:
 *             type: string
 *           description: Backup filename including .zip
 *       responses:
 *         200:
 *           description: Deleted
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/DeleteOneResponse'
 *         401:
 *           description: Unauthorized
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         403:
 *           description: Forbidden
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         404:
 *           description: Not Found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         400:
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *
 *   /api/super/backups/delete-bulk:
 *     post:
 *       tags: [Backups (Super)]
 *       summary: Delete multiple backups
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteBulkRequest'
 *       responses:
 *         200:
 *           description: Bulk delete result
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/DeleteBulkResponse'
 *         401:
 *           description: Unauthorized
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         403:
 *           description: Forbidden
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 *         400:
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StandardError'
 */


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
