import prisma from "./database-service.js";

/*
 * คำอธิบาย : Service สำหรับลบข้อมูลโฮมสเตย์ (Soft Delete)
 * Input : homestayId (number)
 * Output : คืนค่าข้อมูลโฮมสเตย์หลังการลบ
 */

export const homestayDataByID = async (id: number) => {
  const numberId = Number(id);
  
  if (isNaN(numberId)) {
    throw new Error("Incorrect ID");
  }

  const homestay = await prisma.homestay.findUnique({
    where: { id: numberId },
  });

  // ถ้าไม่พบข้อมูลโฮมสเตย์ ให้แจ้ง error
  if (!homestay) {
    throw new Error("Homestay not found");
  }

  // isDeleted = true และบันทึกเวลาที่ลบ (deleteAt)
  return await prisma.homestay.update({
    where: { id: numberId },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });
};
