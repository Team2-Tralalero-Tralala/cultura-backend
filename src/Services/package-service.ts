import bcrypt from "bcrypt";
import prisma from "./database-service.js";
import { z } from "zod";
/*
 * ฟังก์ชัน : getPackagesSchema
 * คำอธิบาย : สแกนข้อมูลแพ็กเกจที่ถูกอนุมัติแล้ว
 * Input : body (any) - ข้อมูลจาก client
 * Output : คืนค่า schema ที่ตรวจสอบแล้ว
 * Process :
 * 1. ใช้ Zod ในการตรวจสอบความถูกต้องของข้อมูล
 * 2. กำหนดให้ statusApprove ต้องเป็น "APPROVE" เท่านั้น
 * 3. คืนค่า schema ที่ตรวจสอบแล้ว
 */
const getPackagesSchema = z.object({
  statusApprove: z.literal("APPROVE").optional(),
});

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
 * คำอธิบาย : ดึงแพ็กเกจที่ถูกอนุมัติแล้ว (APPROVE เท่านั้น)
 * Input : body (any) - ข้อมูลจาก client
 * Output : คืนค่าเป็นอาร์เรย์ของแพ็กเกจที่ถูกอนุมัติ
 * Process :
 * 1. ตรวจสอบความถูกต้องของ body ด้วย Zod 
 * 2. ดึงเฉพาะแพ็กเกจที่มี statusApprove = "APPROVE"
 * 3. รวมชื่อ overseer จากตาราง User
 * 4. คืนค่าอาร์เรย์ของแพ็กเกจที่ถูกอนุมัติ
 */
export async function getPackages(body: any) {
  const parsed = getPackagesSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error("Invalid request body. Allowed statusApprove only 'APPROVE'");
  }
  const packages = await prisma.package.findMany({
    where: {
      ...(body.statusApprove ? { statusApprove: body.statusApprove } : { statusApprove: "APPROVE" }),
    },
    select: {
      name: true,
      statusApprove: true,
      community: {
        select: { name: true },
      },
      overseerPackage: {
        select: { username: true },
      }
    }
  })
  return packages;
}
