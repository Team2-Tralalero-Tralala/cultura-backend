import bcrypt from "bcrypt";
import prisma from "./database-service.js";

// ฟังก์ชันเพื่อดึงแพ็กเกจที่ได้รับการอนุมัติและเผยแพร่แล้ว
export async function getApprovedPublishedPackages() {// ฟังก์ชัน service
  return prisma.package.findMany({// ใช้ Prisma เพื่อค้นหาแพ็กเกจ
    where: {
      statusPackage: "Published",   // เฉพาะที่เผยแพร่
      statusApprove: "Approved",    // และถูกอนุมัติแล้ว
    }
  });
}

