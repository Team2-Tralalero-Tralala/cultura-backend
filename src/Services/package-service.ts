import bcrypt from "bcrypt";
import prisma from "./database-service.js";

// TypeScript type สำหรับ Package ที่ดึงมาจากฐานข้อมูล
interface Packages {
  name: string; // ชื่อแพ็กเกจ
  statusApprove: string; // สถานะการอนุมัติ
  overseerMember: string; // ชื่อของผู้ดูเเล
  community: {
    name: string; // ชื่อชุมชน
  };
}
/*
 * ฟังก์ชัน : getPackages
 * คำอธิบาย : ดึงแพ็กเกจที่ถูกอนุมัติและเผยแพร่แล้ว
 * Input : data (any) - ใช้สำหรับกรอง statusApprove
 * Output : FlattenedPackage[] - คืนค่า array ของ object ที่ field เป็นภาษาไทย
 * Process :
 *   1. ใช้ Prisma ดึงข้อมูลจาก table packages
 *   2. เลือก field name, statusApprove, overseerMemberId และ relation community.name
 *   3. map ข้อมูลให้ flatten field community.name → "ชื่อชุมชน"
 */
export async function getPackages(body: any) {
  const packages = await prisma.package.findMany({
    select: {
      name: true,
      statusApprove: true,
      community: {
        select: { name: true },
      },
      overseerMemberId: true,
    },
  });

  const resultPackages = [];
  for (const pkg of packages) {
    let overseerName = "ไม่พบข้อมูล";
    if (pkg.overseerMemberId) {
      const user = await prisma.user.findUnique({
        where: { id: pkg.overseerMemberId },
        select: { username: true },
      });
      if (user) overseerName = user.username;
    }

    resultPackages.push({
      name: pkg.name,    
      community: pkg.community.name,    
      status: pkg.statusApprove,      
      overseer: overseerName,       
    });
  }

  return resultPackages;
}
