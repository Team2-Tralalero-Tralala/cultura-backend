import bcrypt from "bcrypt";
import prisma from "./database-service.js";

// TypeScript type สำหรับ Package ที่ดึงมาจากฐานข้อมูล
interface Package {
  name: string; // ชื่อแพ็กเกจ
  statusApprove: string; // สถานะการอนุมัติ
  overseerMemberId: string; // id ของผู้ดูเเล
  community: {
    name: string; // ชื่อชุมชน
  };
}

// แปลงข้อมูลให้ field เป็นภาษาไทย
export interface FlattenedPackage {
  "ชื่อแพ็กเกจ": string; // ชื่อแพ็กเกจ
  "สถานะการอนุมัติ": string; // สถานะการอนุมัติ
  "ชื่อชุมชน": string; // ชื่อชุมชน
  "ผู้ดูเเล": string; // ผู้ดูเเล (ชื่อจริง ไม่ใช่ id)
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
  data: any// ข้อมูลกรองจาก client
): Promise<FlattenedPackage[]> { // คืนค่าเป็น array ของ FlattenedPackage
  const packages = await prisma.package.findMany({// ดึงข้อมูลจาก table packages
    where: {
      statusApprove: data.statusApprove || "Approved",// กรองเฉพาะแพ็กเกจที่ statusApprove ตรงกับข้อมูลที่รับมา หรือ "Approved" ถ้าไม่มีข้อมูล
    },
    select: {// เลือกเฉพาะ field ที่ต้องการ
      name: true,// ชื่อแพ็กเกจ
      statusApprove: true,// สถานะการอนุมัติ
      overseerMemberId: true,// id ของผู้ดูเเล
      community: {
        select: { name: true },// เลือกชื่อชุมชนจาก relation community
      },
    },
  });

  // ดึงชื่อผู้ดูแลจาก overseerMemberId
  const flattened: FlattenedPackage[] = [];// สร้าง array ว่างสำหรับเก็บข้อมูลที่แปลงแล้ว
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
    flattened.push({// เพิ่ม object ใหม่ใน array
      "ชื่อแพ็กเกจ": pkg.name,// ชื่อแพ็กเกจ
      "สถานะการอนุมัติ": pkg.statusApprove,// สถานะการอนุมัติ
      "ชื่อชุมชน": pkg.community.name,// ชื่อชุมชน
      "ผู้ดูเเล": overseerName,// ผู้ดูเเล (ชื่อจริง ไม่ใช่ id)
    });
  }

  return flattened;// คืนค่า array ของแพ็กเกจที่แปลงแล้ว
}
