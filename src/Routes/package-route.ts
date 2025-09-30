import express from "express";
import { Router } from "express";
import { getPackagesController } from "../Controllers/package-controller.js";

const packagesRoutes = Router();// สร้าง router ใหม่

packagesRoutes.get("/", getPackagesController);// เส้นทาง GET /api/packages

export default packagesRoutes;// ส่งออก router เพื่อใช้ในที่อื่น