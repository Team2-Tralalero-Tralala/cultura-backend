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
    include: {
      _count: {
        select: {
          tagHomestays: {
            where: {
              homestay: { isDeleted: false },
            },
          },
          tagPackages: {
            where: {
              package: { isDeleted: false },
            },
          },
          tagStores: {
            where: {
              store: { isDeleted: false },
            },
          },
        },
      },
    },
  });
  if (!findTag) throw new Error("ไม่พบประเภทที่ต้องการลบ");

  const totalUsed =
    findTag._count.tagHomestays +
    findTag._count.tagPackages +
    findTag._count.tagStores;
  if (totalUsed > 0) throw new Error("ไม่สามารถลบประเภทที่มีการใช้งานอยู่ได้");

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
export async function getAllTags(
  page: number = 1,
  limit: number = 10,
  search?: string
) {
  const whereCondition: any = { isDeleted: false };
  if (search) {
    whereCondition.name = { contains: search };
  }

  const [tags, totalCount] = await Promise.all([
    prisma.tag.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereCondition,
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: {
            tagHomestays: {
              where: {
                homestay: { isDeleted: false },
              },
            },
            tagPackages: {
              where: {
                package: { isDeleted: false },
              },
            },
            tagStores: {
              where: {
                store: { isDeleted: false },
              },
            },
          },
        },
      },
    }),
    prisma.tag.count({
      where: whereCondition,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const mappedTags = tags.map((tag) => {
    const totalUsed =
      tag._count.tagHomestays + tag._count.tagPackages + tag._count.tagStores;
    const { _count, ...rest } = tag;
    return {
      ...rest,
      isUsed: totalUsed > 0,
    };
  });

  return {
    data: mappedTags,
    pagination: {
      currentPage: page,
      limit,
      totalCount,
      totalPages
    },
  };
}

