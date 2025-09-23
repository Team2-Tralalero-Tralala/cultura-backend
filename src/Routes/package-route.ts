import express from "express";
import { Router } from "express";
import { getApprovedPublishedPackagesController } from "../Controllers/package-controller.js";

const packageRoutes = Router();// สร้าง router ใหม่

packageRoutes.get("/", getApprovedPublishedPackagesController);// เส้นทาง GET /api/package

export default packageRoutes;// ส่งออก router เพื่อใช้ในที่อื่น
