import prisma from "./database-service.js";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลรายละเอียดร้านค้าตามรหัสร้านค้า (Super Admin)
 * Input : รหัสร้านค้า (storeId)
 * Output : ข้อมูลรายละเอียดร้านค้า พร้อมรูปภาพ แท็ก ชุมชน และข้อมูลที่ตั้ง
 */
export async function getStoreById(storeId: number) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      storeImage: {
        select: {
          id: true,
          image: true,
          type: true,
        },
      },
      tagStores: {
        select: {
          tag: { select: { id: true, name: true } },
        },
      },
      community: {
        select: {
          id: true,
          name: true,
        },
      },
      location: true,
    },
  });

  return store;
}
