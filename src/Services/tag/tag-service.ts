/*
 * คำอธิบาย : Service สำหรับจัดการประเภท
 * ประกอบด้วยการสร้าง (create), แก้ไข (edit), ลบ (delete), และดึงข้อมูล Tag ทั้งหมด (get)
 */
import prisma from "../database-service.js";
import { TagDto } from "./tag-dto.js";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างปประเภทใหม่
 * Input : name (string) - ชื่อประเภทที่ต้องการสร้าง
 * Output : tagId (number) - รหัสประเภทที่สร้างใหม่
 */
export async function createTag(tag: TagDto) {
  const tagExists = await prisma.tag.findFirst({
    where: { name: tag.name },
  });

  if (tagExists) throw new Error("มีประเภทนี้อยู่แล้วในระบบ");

  return await prisma.tag.create({
    data: { name: tag.name },
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบประเภท
 * Input : id (number) - รหัสประเภทที่ต้องการลบ
 * Output : message (string) - ข้อความยืนยันการลบ
 */
export async function deleteTagById(tagId: number) {
  const findTag = await prisma.tag.findUnique({
    where: { id: tagId, isDeleted: false },
  });
  if (!findTag) throw new Error("ไม่พบประเภทที่ต้องการลบ");

  return await prisma.tag.update({
    where: { id: tagId },
    data: { isDeleted: true, deleteAt: new Date() },
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแก้ไขประเภทที่กำหนด
 * Input : id (number) - รหัสประเภทที่ต้องการแก้ไข
 * Output : message (string) - ข้อความยืนยันการแก้ไข
 */
export async function editTag(tagId: number, tag: TagDto) {
  const findTag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!findTag) throw new Error("ไม่พบประเภทที่ต้องการแก้ไข");

  return await prisma.tag.update({
    where: { id: tagId },
    data: { name: tag.name },
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลประเภททั้งหมด
 * Input : -
 * Output : tags (Array) - รายการประเภททั้งหมด
 */
export async function getAllTags(page: number = 1, limit: number = 10) {
  const [tags, totalCount] = await Promise.all([
    prisma.tag.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { isDeleted: false },
      orderBy: { id: "asc" },
    }),
    prisma.tag.count({
      where: { isDeleted: false },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: tags,
    pagination: {
      currentPage: page,
      limit,
      totalCount,
      totalPages
    },
  };
}

