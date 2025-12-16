// src/Routes/search-route.ts
import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import {
  search,
  searchDto
} from "../Controllers/search-controller.js";

const searchRoutes = Router();

/**
 * @swagger
 * /api/tourist/search/overview:
 *   get:
 *     summary: ค้นหาแพ็กเกจและชุมชน
 *     description: |
 *       รองรับการค้นหาแบบยืดหยุ่น:
 *       1. ค้นหาตาม keyword: ใช้ query parameter `search`
 *       2. ค้นหาตาม tag(s): ใช้ query parameter `tag` (หลาย tag) หรือ `tags` (comma-separated)
 *       3. ค้นหาตาม keyword และ tag(s) ร่วมกัน: ใช้ทั้ง `search` และ `tag`/`tags`
 *       4. กรองตามราคา: ใช้ `priceMin` และ `priceMax`
 *       5. รองรับ pagination: `page` และ `limit`
 *       สำหรับนักท่องเที่ยว (Tourist) - ไม่ต้องยืนยันตัวตน
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: คำค้นหาสำหรับค้นหาทั้งแพ็กเกจและชุมชน
 *         example: "ชุมชน"
 *       - in: query
 *         name: tag
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: ชื่อ tag ที่ต้องการค้นหาแพ็กเกจ (สามารถระบุหลาย tag ได้)
 *         example: ["ธรรมชาติ", "อาหาร"]
 *       - in: query
 *         name: tags
 *         required: false
 *         schema:
 *           type: string
 *         description: ชื่อ tag แบบ comma-separated (เช่น "tag1,tag2")
 *         example: "ธรรมชาติ,อาหาร"
 *       - in: query
 *         name: priceMin
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: ราคาขั้นต่ำ
 *         example: 1000
 *       - in: query
 *         name: priceMax
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: ราคาสูงสุด
 *         example: 5000
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หมายเลขหน้า
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: จำนวนรายการต่อหน้า
 *     responses:
 *       200:
 *         description: ดึงข้อมูลผลลัพธ์การค้นหาสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ดึงข้อมูลผลลัพธ์การค้นหาตาม tag สำเร็จ"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "แพ็กเกจท่องเที่ยวชุมชน"
 *                       description:
 *                         type: string
 *                         example: "ท่องเที่ยวชุมชนเรียนรู้วิถีชีวิต"
 *                       price:
 *                         type: number
 *                         example: 1500
 *                       capacity:
 *                         type: integer
 *                         example: 20
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       facility:
 *                         type: string
 *                         example: "อาหาร, ที่พัก"
 *                       community:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       location:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           province:
 *                             type: string
 *                           district:
 *                             type: string
 *                           subDistrict:
 *                             type: string
 *                       coverImage:
 *                         type: string
 *                         nullable: true
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *       400:
 *         description: คำขอไม่ถูกต้อง (ไม่ระบุ tag หรือ search)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "กรุณาระบุ tag ที่ต้องการค้นหา"
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

/*
 * เส้นทาง : GET /api/tourist/search/overview
 * คำอธิบาย : ค้นหาแพ็กเกจและชุมชน
 * รองรับ:
 *   - ?search=keyword - ค้นหาตาม keyword
 *   - ?tag=tag1&tag=tag2 - ค้นหาตาม tag(s) (หลาย tag)
 *   - ?tags=tag1,tag2 - ค้นหาตาม tag(s) (comma-separated)
 *   - ?search=keyword&tag=tag1&tag=tag2 - ค้นหาตาม keyword และ tag(s) ร่วมกัน
 *   - ?priceMin=1000&priceMax=5000 - กรองตามราคา
 *   - ?page=1&limit=10 - pagination
 * Input : Query parameters (search, tag, tags, priceMin, priceMax, page, limit)
 * Output : ข้อมูลแพ็กเกจและชุมชนที่เกี่ยวข้อง
 */
searchRoutes.get(
  "/overview",
  validateDto(searchDto),
  search
);

export default searchRoutes;
