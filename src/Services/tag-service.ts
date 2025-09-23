/*
 * คำอธิบาย : Service สำหรับจัดการ Tag
 * ประกอบด้วยการสร้าง (create), แก้ไข (edit), ลบ (delete), และดึงข้อมูล Tag ทั้งหมด(get)
 * โดยเชื่อมต่อกับฐานข้อมูลผ่าน Prisma
 */
import prisma from "./database-service.js";

/*
 * ฟังก์ชัน : createTag
 * คำอธิบาย : สร้าง Tag ใหม่
 * Input : name (string) - ชื่อ Tag ที่ต้องการสร้าง
 * Output : tagId (number) - รหัส Tag ที่สร้างใหม่
 * Error : throw error ถ้าไม่สามารถสร้าง Tag ได้
 */
export async function createTag(data: { name: string }) {
  const tag = await prisma.tag.findFirst({
    where: { name: data.name },
  });

  if (tag) throw new Error("Tag already exists");

  const newTag = await prisma.tag.create({
    data: { name: data.name },
  });
  
  return newTag;
}

/*
 * ฟังก์ชัน : deleteTag
 * คำอธิบาย : ลบ Tag ที่กำหนด
 * Input : id (number) - รหัส Tag ที่ต้องการลบ
 * Output : message (string) - ข้อความยืนยันการลบ
 * Error : throw error ถ้าไม่พบ Tag
 */
export async function deleteTag(data: { id: number }) {
  const existingTag = await prisma.tag.findUnique({
    where: { id: data.id },
  });

  if (!existingTag) throw new Error("Tag not found");

  const deletedTag = await prisma.tag.delete({
    where: { id: data.id },
  });

  return deletedTag;
}

/*
 * ฟังก์ชัน : editTag
 * คำอธิบาย : แก้ไข Tag ที่กำหนด
 * Input : id (number) - รหัส Tag ที่ต้องการแก้ไข
 * Output : message (string) - ข้อความยืนยันการแก้ไข
 * Error : throw error ถ้าไม่พบ Tag
 */
export async function editTag( id: number, data:any ) {
  const tag = await prisma.tag.findUnique({ where: { id: id } });
  if (!tag) throw new Error("Tag not found");
  console.log(data);
  return await prisma.tag.update({
    where: { id: id },
    data: { name: data.name },
  });
}

/*
 * ฟังก์ชัน : getAllTags
 * คำอธิบาย : ดึงข้อมูล Tag ทั้งหมด
 * Input : -
 * Output : tags (Array) - รายการ Tag ทั้งหมด
 * Error : throw error ถ้าไม่สามารถดึงข้อมูลได้
 */
export async function getAllTags() {
  return await prisma.tag.findMany();
}