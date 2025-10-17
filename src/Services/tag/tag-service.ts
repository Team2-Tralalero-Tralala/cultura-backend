/*
 * คำอธิบาย : Service สำหรับจัดการ Tag
 * ประกอบด้วยการสร้าง (create), แก้ไข (edit), ลบ (delete), และดึงข้อมูล Tag ทั้งหมด(get)
 * โดยเชื่อมต่อกับฐานข้อมูลผ่าน Prisma
 */
import prisma from "../database-service.js";
import { TagDto} from "./tag-dto.js";

/*
 * ฟังก์ชัน : createTag
 * คำอธิบาย : สร้าง Tag ใหม่
 * Input : name (string) - ชื่อ Tag ที่ต้องการสร้าง
 * Output : tagId (number) - รหัส Tag ที่สร้างใหม่
 * Error : throw error ถ้าไม่สามารถสร้าง Tag ได้
 */
export async function createTag(tag : TagDto) {
  const tagExists = await prisma.tag.findFirst({
    where: { name: tag.name },
  });

  if (tagExists) throw new Error("Tag already exists");

  return await prisma.tag.create({
    data: { name: tag.name },
  });
}

/*
 * ฟังก์ชัน : deleteTag
 * คำอธิบาย : ลบ Tag ที่กำหนด
 * Input : id (number) - รหัส Tag ที่ต้องการลบ
 * Output : message (string) - ข้อความยืนยันการลบ
 * Error : throw error ถ้าไม่พบ Tag
 */
export async function deleteTagById(tagId:number) {
  const findTag = await prisma.tag.findUnique({
    where: { id: tagId, isDeleted: false },
  });
  if (!findTag) throw new Error("Tag not found");

  return await prisma.tag.update({
    where: { id: tagId },
    data: {isDeleted: true, deleteAt: new Date()},
  });
}

/*
 * ฟังก์ชัน : editTag
 * คำอธิบาย : แก้ไข Tag ที่กำหนด
 * Input : id (number) - รหัส Tag ที่ต้องการแก้ไข
 * Output : message (string) - ข้อความยืนยันการแก้ไข
 * Error : throw error ถ้าไม่พบ Tag
 */
export async function editTag( tagId:number, tag:TagDto) {
  const findTag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!findTag) throw new Error("Tag not found");
  
  return await prisma.tag.update({
    where: { id: tagId },
    data: { name: tag.name },
  });
}

/*
 * ฟังก์ชัน : getAllTags
 * คำอธิบาย : ดึงข้อมูล Tag ทั้งหมด
 * Input : -
 * Output : tags (Array) - รายการ Tag ทั้งหมด
 * Error : throw error ถ้าไม่สามารถดึงข้อมูลได้
 */
export async function getAllTags(
  page: number = 1,
  limit: number = 10) {
  const result = await prisma.tag.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { isDeleted: false },
    orderBy: { id: "asc" },
  });
  return result;
}