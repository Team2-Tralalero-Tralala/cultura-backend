import { PackagePublishStatus } from "@prisma/client";
import prisma from "./database-service.js";

/*
 * ฟังก์ชัน : getDraftPackage
 * คำอธิบาย : ดึงแพ็กเกจที่เป็น DRAFT เท่านั้น และเลือกเฉพาะข้อมูลสำคัญ
 * Output : คืนชื่อแพ็กเกจ, ชื่อชุมชน, ชื่อผู้ดูแล, สถานะแพ็กเกจ
 */
export async function getStoreById(createById: number) {
  const store = await prisma.store.findUnique({
    where: {
      id: createById,
    },
    select: {
      id: true,
      name: true,
      detail: true,
      tagStores: {
        select: {
          tag: { select: { name: true } },
        },
      },
    },
  });

  return store;
}
   