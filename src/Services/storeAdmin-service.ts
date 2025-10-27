import prisma from "./database-service.js";

/*
 * ฟังก์ชัน : getStoreById
 * คำอธิบาย : ดึงข้อมูลร้านค้าพร้อมรูปภาพทั้งหมด และความสัมพันธ์อื่น ๆ เช่นแท็ก ชุมชน ที่ตั้ง
 */
export async function getStoreById(storeId: number) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      // ✅ ชื่อ relation ต้องตรงกับ schema (storeImage)
      storeImgae: {
        select: {
          id: true,
          image: true,
          type: true,
        },
      },
      // ดึงแท็กร้าน (tagStores → tag)
      tagStores: {
        select: {
          tag: { select: { id: true, name: true } },
        },
      },
      // ดึงชื่อชุมชน
      community: {
        select: {
          id: true,
          name: true,
        },
      },
      // ดึงตำแหน่งที่ตั้ง (ถ้ามี latitude, longitude)
      location: true,
    },
  });

  return store;
}
