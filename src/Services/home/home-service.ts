/*
 * คำอธิบาย : Service สำหรับจัดการข้อมูลหน้าแรก (Home)
 * ประกอบด้วยการดึงข้อมูล carousel images และ activity tags
 * โดยเชื่อมต่อกับฐานข้อมูลผ่าน Prisma
 */
import prisma from "../database-service.js";

/*
 * คำอธิบาย : ดึงข้อมูลสำหรับหน้าแรก รวมถึง carousel images และ activity tags
 * Input : -
 * Output : object ประกอบด้วย carouselImages และ activityTags
 */
export async function getHomeData() {
  // ดึง tags ทั้งหมดที่ยังไม่ถูกลบ พร้อมนับจำนวน package ที่อ้างอิง
  const tags = await prisma.tag.findMany({
    where: { isDeleted: false },
    select: {
      name: true,
    },
    orderBy: {
      tagPackages: {
        _count: "desc",
      },
    },
    take: 20,
  });

  // แปลง tags เป็น array ของชื่อ
  const activityTags = tags.map((tag) => tag.name);

  const carouselImages = await prisma.banner.findMany({
    select: {
      image: true,
    },
    take: 5,
  });

  return {
    carouselImages,
    activityTags,
  };
}
