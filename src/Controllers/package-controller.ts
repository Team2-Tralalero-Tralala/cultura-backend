import type { Request, Response } from "express";
import { getApprovedPublishedPackages } from "../Services/package-service.js";
/*
 * Controller : getApprovedPublishedPackagesController
 * คำอธิบาย : ดึงแพ็กเกจที่ถูกอนุมัติและเผยแพร่แล้ว
 * Process :
 *   1. เรียกใช้ service getApprovedPublishedPackages
 *   2. ส่งผลลัพธ์กลับ client พร้อม status 200
 *   3. จัดการข้อผิดพลาดด้วย status 500
 */
export async function getApprovedPublishedPackagesController(req: Request, res: Response) {// ฟังก์ชัน controller
  try {
    const packages = await getApprovedPublishedPackages(req.body);// เรียกใช้ฟังก์ชันจาก service พร้อมข้อมูลจาก client
    return res.status(200).json({// ส่งข้อมูลกลับไปยัง client
      success: true,// เพิ่มฟิลด์ success
      data: packages,// ข้อมูลแพ็กเกจ
    });
  } catch (error) {// จัดการข้อผิดพลาด
    console.error("Error fetching packages:", error);// บันทึกข้อผิดพลาดลงใน console
    return res.status(500).json({// ส่งสถานะ 500 และข้อความข้อผิดพลาด
      success: false,// เพิ่มฟิลด์ success
      message: "Internal Server Error",// ข้อความข้อผิดพลาด
    });
  }
}