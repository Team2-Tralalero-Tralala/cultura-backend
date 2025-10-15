import { PackagePublishStatus } from "@prisma/client";
import prisma from "./database-service.js";

/*
 * ฟังก์ชัน : getDraftPackage
 * คำอธิบาย : ดึงแพ็กเกจที่เป็น DRAFT เท่านั้น และเลือกเฉพาะข้อมูลสำคัญ
 * Output : คืนชื่อแพ็กเกจ, ชื่อชุมชน, ชื่อผู้ดูแล, สถานะแพ็กเกจ
 */
export async function getDraftPackage(createById: number) {
  const draftPackage = await prisma.package.findMany({
    where: {
      statusPackage: PackagePublishStatus.DRAFT,
      createById: createById,
    },
    select: {
      name: true, // ชื่อแพ็กเกจ
      statusPackage: true, // สถานะแพ็กเกจ
      community: {
        select: {
          name: true, // ชื่อชุมชน
        },
      },
      overseerPackage: {
        select: {
          username: true, // ชื่อผู้ดูแลแพ็กเกจ
        },
      },
    },
  });

  return draftPackage;
}
