import prisma from "./database-service.js";

/*
ฟังก์ชัน : getCommunityById
คำอธิบาย : ค้นหาชุมชนในฐานข้อมูลจาก id
Input : id (number) - ไอดีของชุมชนที่ต้องการค้นหา
Output : communities object - ข้อมูลชุมชนที่พบ
Error : throw error ถ้าไม่พบชุมชน
*/
export async function getCommunityById(id: number) {
    const communities = await prisma.community.findUnique({
      where: { id },
    });
    if (!communities) throw new Error("Community not found");
    return communities;
}