import bcrypt from "bcrypt";
import prisma from "./database-service.js";

// TypeScript type สำหรับ Package ที่ดึงมาจากฐานข้อมูล
interface Package {
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
export async function getPackages(
  data: any// ข้อมูลกรองจาก client
) { // คืนค่าเป็น array ของ FlattenedPackage
  const packages = await prisma.package.findMany({
  where: {
    OR: [
      { statusApprove: "Approved" },
      { statusApprove: data.statusApprove },
    ],
  },
  select: {
    name: true,
    statusApprove: true,
    overseerMemberId: true,
    community: { select: { name: true } },
  },
});

  // ดึงชื่อผู้ดูแลจาก overseerMemberId
  for (const pkg of packages) {// วนลูปผ่านแต่ละแพ็กเกจที่ดึงมา
    let overseerName = "ไม่พบข้อมูล";// กำหนดค่าเริ่มต้นของชื่อผู้ดูแล
    // ตรวจสอบว่า overseerMemberId มีค่าไหม ถ้ามีให้ดึงชื่อผู้ดูแลจาก table users
    if (pkg.overseerMemberId) {
      const overseer = await prisma.user.findUnique({// ดึงข้อมูลผู้ใช้จาก table users
        where: { id: pkg.overseerMemberId }, // ใช้ overseerMemberId เป็นเงื่อนไขการค้นหา
        select: { username: true},// เลือกเฉพาะ field username
      });
      // ถ้าพบผู้ดูแล ให้ตั้งค่า overseerName เป็นชื่อผู้ดูแล
      if (overseer) {
        overseerName = overseer.username;// ตั้งชื่อผู้ดูแลเป็น username
      }
    }
// เพิ่มข้อมูลที่แปลงแล้วลงใน array flattened
    (pkg as any).ชื่อผู้ดูแล = overseerName;// เพิ่ม field ชื่อผู้ดูแล
  }

  return packages;// คืนค่า array ของแพ็กเกจที่แปลงแล้ว
}
