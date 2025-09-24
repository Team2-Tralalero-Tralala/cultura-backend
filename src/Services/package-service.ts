import bcrypt from "bcrypt";
import prisma from "./database-service.js";

// TypeScript type สำหรับ Package ที่ดึงมาจากฐานข้อมูล
interface Package {// Interface สำหรับ Package
  name: string;// ชื่อแพ็กเกจ
  statusApprove: string;// สถานะการอนุมัติ
  overseerMemberId: string; // ชื่อผู้ดูเเล
  community: {
    name: string;// ชื่อชุมชน
  };
}

// แปลงข้อมูลให้ field เป็นภาษาไทย
export interface FlattenedPackage {
  "ชื่อแพ็กเกจ": string;// ชื่อแพ็กเกจ
  "สถานะการอนุมัติ": string;// สถานะการอนุมัติ
  "ชื่อชุมชน": string;// ชื่อชุมชน
  "ผู้ดูเเล": string;// ผู้ดูเเล
}

/*
 * ฟังก์ชัน : getApprovedPublishedPackages
 * คำอธิบาย : ดึงแพ็กเกจที่ถูกอนุมัติและเผยแพร่แล้ว
 * Input : data (any) - ใช้สำหรับกรอง statusApprove
 * Output : FlattenedPackage[] - คืนค่า array ของ object ที่ field เป็นภาษาไทย
 * Process :
 *   1. ใช้ Prisma ดึงข้อมูลจาก table packages
 *   2. เลือก field name, statusApprove, overseerMemberId และ relation community.name
 *   3. map ข้อมูลให้ flatten field community.name → "ชื่อชุมชน"
 */
export async function getApprovedPublishedPackages(
  data: any // ข้อมูลกรองจาก client
): Promise<FlattenedPackage[]> {// คืนค่าเป็น array ของ FlattenedPackage
  const packages = await prisma.package.findMany({// ดึงข้อมูลจาก table packages
    where: {
      statusApprove: data.statusApprove || "Approved",// กรองเฉพาะแพ็กเกจที่ statusApprove ตรงกับข้อมูลที่รับมา หรือ "Approved" ถ้าไม่มีข้อมูล
    },
    select: {// เลือกเฉพาะ field ที่ต้องการ
      name: true,// ชื่อแพ็กเกจ
      statusApprove: true,// สถานะการอนุมัติ
      overseerMemberId: true, // ชื่อผู้ดูเเล
      community: {
        select: { name: true },// เลือกชื่อชุมชนจาก relation community
      },
    },
  });

  // map ข้อมูลให้ flatten field community.name → "ชื่อชุมชน"
  const flattened: FlattenedPackage[] = packages.map((pkg: Package) => ({
    "ชื่อแพ็กเกจ": pkg.name,// ชื่อแพ็กเกจ
    "สถานะการอนุมัติ": pkg.statusApprove,// สถานะการอนุมัติ
    "ชื่อชุมชน": pkg.community.name,// ชื่อชุมชน
    "ผู้ดูเเล": pkg.overseerMemberId,// ผู้ดูเเล
  }));

  return flattened; // ส่งกลับข้อมูลที่เเปลงเเล้ว
}
