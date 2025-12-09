/*
 * คำอธิบาย : Router สำหรับจัดการเส้นทาง (Route) ของข้อมูลหน้าแรก (Home)
 * ใช้สำหรับเชื่อมโยงเส้นทาง API เข้ากับ Controller ที่เกี่ยวข้องกับการแสดงข้อมูลหน้าแรก
 * โดยเป็น public API ที่ไม่ต้องยืนยันตัวตน
 */
import { Router } from "express";
import { validateDto } from "~/Libs/validateDto.js";
import * as HomeController from "../Controllers/home-controller.js";

const homeRoutes = Router();

/**
 * @swagger
 * /api/tourist/home:
 *   get:
 *     summary: ดึงข้อมูลหน้าแรก (Public API)
 *     description: ใช้สำหรับดึงข้อมูล carousel images และ activity tags สำหรับหน้าแรก ไม่ต้องยืนยันตัวตน
 *     tags:
 *       - Tourist
 *     responses:
 *       200:
 *         description: ดึงข้อมูลหน้าแรกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomeResponse'
 *       400:
 *         description: เกิดข้อผิดพลาดในการดึงข้อมูล
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateErrorResponse'
 *
 * components:
 *   schemas:
 *     CarouselImage:
 *       type: object
 *       properties:
 *         src:
 *           type: string
 *           example: "/uploads/ViewTiwTouch.jpg"
 *         alt:
 *           type: string
 *           example: "ภาพทิวทัศน์ธรรมชาติ"
 *     HomeResponse:
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
 *           example: "ดึงข้อมูลหน้าแรกสำเร็จ"
 *         data:
 *           type: object
 *           properties:
 *             carouselImages:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarouselImage'
 *             activityTags:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["เดินป่า", "ปีนเขา", "แคมป์ปิ้ง"]
 *     CreateErrorResponse:
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
 *           example: "เกิดข้อผิดพลาดในการดึงข้อมูล"
 *         errorId:
 *           type: string
 *           example: "de305d54-75b4-431b-adb2-eb6b9e546014"
 */

/**
 * คำอธิบาย : route สำหรับดึงข้อมูลหน้าแรก
 * สิทธิ์ที่เข้าถึงได้ : ทุกคน (Public API)
 */
homeRoutes.get(
  "/tourist/home",
  validateDto(HomeController.getHomeDto),
  HomeController.getHome
);

export default homeRoutes;

