import bcrypt from "bcrypt";
import prisma from "./database-service.js";

interface Packages {
  name: string;
  statusApprove: string;
  overseerMember: string;  
  community: {
    name: string;
  };
}
/*
 * ฟังก์ชัน : getPackages
 * คำอธิบาย : ดึงแพ็กเกจที่ถูกอนุมัติและเผยแพร่แล้ว
 * Input : data (any) - ใช้สำหรับกรอง statusApprove
 * Output : array ของแพ็กเกจ ที่มีชื่อ overseer
 * Process :
 *  1. ดึงข้อมูลแพ็กเกจจากฐานข้อมูล
 *  2. สำหรับแต่ละแพ็กเกจ ดึงชื่อ overseer จากตาราง user
 *  3. สร้าง array ใหม่ที่มีข้อมูลแพ็กเกจพร้อมชื่อ overseer
 *  4. ส่งกลับ array ของแพ็กเกจ
 */
export async function getPackages(body: any) {
  const packages = await prisma.package.findMany({
    where: {
      OR: [ { statusApprove: "APPROVE" }, 
            { statusApprove: body.statusApprove }
      ]},
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
      statusAppove: pkg.statusApprove,      
      overseer: overseerName,       
    });
  }

  return resultPackages;
}
