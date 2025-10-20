import prisma from "../database-service.js";

/*
 * ฟังก์ชัน: getHomestayById
 * Input :
 *   - homestayId: รหัสที่พัก
 * Output:
 *   - homestay + relations
 * Error:
 *   - "ID must be Number"
 *   - "Homestay not found"
 */

export async function getHomestayById(homestayId: number) {
  // ตรวจสอบค่า ID
  if (!Number.isInteger(homestayId) || homestayId <= 0) {
    throw new Error("ID must be Number");
  }

  // ดึงข้อมูล homestay พร้อม relations
  const homestay = await prisma.homestay.findFirst({
    where: { id: homestayId, isDeleted: false },
    
    include: {
      location: true,
      homestayImage: true,
      tagHomestays: {
        include: { tag: true },
      },
      community: {
        select: {
            id: true,
            name: true,
        }
      },
    },
  });

  if (!homestay) throw new Error("Homestay not found");

  return homestay;
}
