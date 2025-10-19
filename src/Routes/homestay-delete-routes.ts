import express from "express";
import { homestayDataByID } from "../Controllers/homestay-delete-controllers.js";

const router = express.Router();

/*
 * คำอธิบาย : Route สำหรับ Super Admin ลบข้อมูลโฮมสเตย์
 * Path : DELETE /api/super/homestays/:id
 */

router.delete("/:id", homestayDataByID);

export default router;
