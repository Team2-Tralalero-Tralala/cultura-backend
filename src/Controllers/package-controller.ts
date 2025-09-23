import type { Request, Response } from "express";
import { getApprovedPublishedPackages } from "../Services/package-service.js";

// Controller เพื่อดึงแพ็กเกจที่ได้รับการอนุมัติและเผยแพร่แล้ว
export async function getApprovedPublishedPackagesController(req: Request, res: Response) {// ฟังก์ชัน controller
  try {
    const packages = await getApprovedPublishedPackages();// เรียกใช้ฟังก์ชันจาก service
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