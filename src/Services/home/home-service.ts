/*
 * คำอธิบาย : Service สำหรับจัดการข้อมูลหน้าแรก (Home)
 * ประกอบด้วยการดึงข้อมูล carousel images และ activity tags
 * โดยเชื่อมต่อกับฐานข้อมูลผ่าน Prisma
 */
import prisma from "../database-service.js";

/*
 * ฟังก์ชัน : getHomeData
 * คำอธิบาย : ดึงข้อมูลสำหรับหน้าแรก รวมถึง carousel images และ activity tags
 * Input : -
 * Output : object ประกอบด้วย carouselImages และ activityTags
 * Error : throw error ถ้าไม่สามารถดึงข้อมูลได้
 */
export async function getHomeData() {
  // ดึง tags 20 อันดับแรกที่มีการอ้างอิงสูงสุด
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

  // กำหนด carousel images จากไฟล์ใน uploads folder
  // const carouselImages = [
  //   {
  //     src: "/uploads/ViewTiwTouch.jpg",
  //     alt: "ภาพทิวทัศน์ธรรมชาติ",
  //   },
  //   {
  //     src: "/uploads/photo-1506905925346-21bda4d32df4.jpg",
  //     alt: "ภาพป่าไม้",
  //   },
  //   {
  //     src: "/uploads/photo-1441974231531-c6227db76b6e.jpg",
  //     alt: "ภาพธรรมชาติ",
  //   },
  // ];
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
