
/*
 * ฟังก์ชัน : getPackagesSchema
 * คำอธิบาย : สแกนข้อมูลแพ็กเกจที่เป็น DRAFT เท่านั้น
 * Input : body (any) - ข้อมูลจาก client
 * Output : คืนค่า schema ที่ตรวจสอบแล้ว
 * Process :
 * 1. ใช้ Zod ในการตรวจสอบความถูกต้องของข้อมูล
 * 2. กำหนดให้ statusPackage ต้องเป็น "DRAFT" เท่านั้น
 * 3. คืนค่า schema ที่ตรวจสอบแล้ว
 */
import { PackagePublishStatus } from "@prisma/client";
/*
 * ฟังก์ชัน : getPackages
 * คำอธิบาย : ดึงแพ็กเกจที่เป็น DRAFT เท่านั้น
 * Input : body (any) - ข้อมูลจาก client
 * Output : คืนค่าเป็นอาร์เรย์ของแพ็กเกจที่เป็น DRAFT
 * Process :
 * 1. ตรวจสอบความถูกต้องของ body ด้วย Zod 
 * 2. ดึงเฉพาะแพ็กเกจที่มี statusPackage = "DRAFT"
 * 3. รวมชื่อ overseer จากตาราง User
 * 4. คืนค่าอาร์เรย์ของแพ็กเกจที่เป็น DRAFT
 */

export async function getDraftPackage(createById: number) {
const draftPackage = await prisma.package.findMany({
where: {
statusPackage: PackagePublishStatus.DRAFT,
createById: createById,
},
include: { location: true, homestayHistories: true },
});
return draftPackage;
}