import { Router } from "express";
import { createPackage } from "../Controllers/package-controller.js";

const router = Router();

// กำหนด endpoint ตามที่คุณออกแบบ
router.post("/createPackage", createPackage);