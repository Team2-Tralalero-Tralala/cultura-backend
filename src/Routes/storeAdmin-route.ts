import { Router } from "express";
import { getStoreById, storeDto } from "~/Controllers/storeAdmin-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
const storeRoutes = Router();
/**
 * @swagger
 * /api/admin/stores/{id}:
 *   get:
 *     summary: ดึงข้อมูลร้านค้าตาม storeId
 *     description: ดึงข้อมูลร้านค้าพร้อมรูปภาพ แท็ก ชุมชน และตำแหน่งที่ตั้ง
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         example: 1
 *         required: true
 *         description: ID ของร้านค้าที่ต้องการดึง
 *     responses:
 *       200:
 *         description: Fetched store successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Fetched store successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: ร้านกาแฟ
 *                     detail:
 *                       type: string
 *                       example: รายละเอียดร้าน
 *                     storeImage:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                             example: 1
 *                           image:
 *                             type: string
 *                             example: image-url.jpg
 *                           type:
 *                             type: string
 *                             example: thumbnail
 *                     tagStores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: number
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: กาแฟ
 *                     community:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: ชุมชน A
 *                     location:
 *                       type: object
 *                       properties:
 *                         lat:
 *                           type: number
 *                           example: 13.7563
 *                         lng:
 *                           type: number
 *                           example: 100.5018
 *       400:
 *         description: Bad request / Invalid store id
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               message: Missing store id in URL path
 *       404:
 *         description: Store not found
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               message: Store not found
 */
/**
 * คำอธิบาย : (Admin) Route สำหรับดึงข้อมูลรายละเอียดร้านค้า ตาม ID
 */
storeRoutes.get("/:id", 
    authMiddleware, 
    validateDto(storeDto), 
    allowRoles("admin"),
    getStoreById
);

export default storeRoutes;