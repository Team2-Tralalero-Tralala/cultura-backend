import { Router } from "express";

// นำเข้าฟังก์ชันควบคุม (Controller) ที่ใช้จัดการข้อมูลการจอง
// getByCommunity → ดึงข้อมูลประวัติการจองตาม communityId
// getByMember → ดึงข้อมูลประวัติการจองตาม memberId
import { getByCommunity, getByMember } from "../Controllers/booking-history-controller.js";

// สร้างตัว router สำหรับกำหนดเส้นทาง
const router = Router();

// เส้นทาง (Route) สำหรับดึงข้อมูลประวัติการจองตาม communityId
router.get("/community/:communityId", getByCommunity);

// เส้นทาง (Route) สำหรับดึงข้อมูลประวัติการจองตาม memberId
router.get("/member/:memberId", getByMember);

// ส่งออก router นี้ไปใช้ในส่วนอื่นของแอปพลิเคชัน
export default router;
