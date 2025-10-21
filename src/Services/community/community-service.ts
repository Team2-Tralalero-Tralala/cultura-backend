import prisma from "../database-service.js";
import { CommunityDto } from "./community-dto.js";
import { LocationDto } from "../location/location-dto.js";
import type { PaginationResponse } from "../pagination-dto.js";

/*
 * คำอธิบาย : ฟังก์ชันช่วยแปลงข้อมูล LocationDto ให้เป็น object ที่ Prisma ใช้ได้
 * Input :
 *   - loc (LocationDto) : ข้อมูลที่อยู่ของชุมชน
 * Output :
 *   - Object ที่พร้อมสำหรับสร้างหรืออัปเดตข้อมูลใน Prisma
 */
export const mapLocation = (loc: LocationDto) => ({
  houseNumber: loc.houseNumber,
  villageNumber: loc.villageNumber ?? null,
  alley: loc.alley ?? null,
  subDistrict: loc.subDistrict,
  district: loc.district,
  province: loc.province,
  postalCode: loc.postalCode,
  latitude: loc.latitude,
  longitude: loc.longitude,
  detail: loc.detail ?? null,
});

/*
 * คำอธิบาย : ตรวจสอบว่า member ที่ส่งมามีอยู่จริงและมี role = member
 * Input :
 *   - memberIds (number[]) : รายการ id ของสมาชิกที่ต้องการตรวจสอบ
 * Output :
 *   - รายชื่อสมาชิกที่ตรวจสอบแล้วถูกต้อง (id, fname, lname)
 * Exception :
 *   - หากพบ id ที่ไม่ตรงหรือไม่ใช่ role:member จะโยน error พร้อม invalidIds กลับไป
 */
export async function checkMember(memberIds: number[]) {
  const members = await prisma.user.findMany({
    where: {
      id: { in: memberIds },
      role: { name: "member" },
      isDeleted: false,
    },
    select: { id: true, fname: true, lname: true },
  });

  if (members.length !== memberIds.length) {
    const foundIds = members.map((member) => member.id);
    const invalidIds = memberIds.filter((id) => !foundIds.includes(id));
    throw {
      status: 400,
      message: "มีสมาชิกบางรายไม่ถูกต้อง หรือไม่ใช่สมาชิก",
      invalidIds,
    };
  }

  return members;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างข้อมูลชุมชนใหม่
 * Input :
 *   - community (CommunityDto) : ข้อมูลชุมชนที่รับมาจาก Controller
 * Output :
 *   - Object ของชุมชนที่ถูกสร้างพร้อมความสัมพันธ์ (location, admin, image)
 * หมายเหตุ :
 *   - ตรวจสอบ admin ว่ามีสิทธิ์ถูกต้อง (role = admin)
 *   - ตรวจสอบชื่อและเลขทะเบียนซ้ำก่อนสร้าง
 *   - รองรับการแนบไฟล์รูปภาพ (logo, cover, gallery)
 */
export async function createCommunity(community: CommunityDto) {
  const {
    location,
    adminId,
    communityImage,
    communityMembers,
    ...communityData
  } = community;

  return prisma.$transaction(async (transaction) => {
    // ตรวจสอบ admin
    const checkAdmin = await transaction.user.findFirst({
      where: { id: adminId, role: { name: "admin" } },
    });
    if (!checkAdmin) throw new Error("ผู้ใช้ไม่ใช่แอดมิน");

    // ตรวจสอบชื่อหรือเลขทะเบียนซ้ำ
    const duplicate = await transaction.community.findFirst({
      where: {
        OR: [
          { name: communityData.name },
          { registerNumber: communityData.registerNumber },
        ],
      },
    });
    if (duplicate) throw new Error("มีชุมชนนี้อยู่แล้ว");

    // สร้างชุมชนใหม่
    const newCommunity = await transaction.community.create({
      data: {
        ...communityData,
        admin: { connect: { id: adminId } },
        location: { create: mapLocation(location) },
        ...(communityImage?.length
          ? {
              communityImage: {
                create: communityImage
                  .filter((img) => !!img.image) // ✅ ตัดอันที่ undefined/null ออก
                  .map((img) => ({
                    image: img.image,
                    type: img.type,
                  })),
              },
            }
          : {}),
      },
      include: {
        location: true,
        communityImage: true,
        admin: { select: { id: true, fname: true, lname: true } },
        communityMembers: {
          select: { id: true },
        },
      },
    });

    if (community.communityMembers?.length) {
      await transaction.communityMembers.createMany({
        data: community.communityMembers.map((memberId) => ({
          communityId: newCommunity.id,
          memberId,
        })),
      });
    }

    return newCommunity;
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแก้ไขข้อมูลของชุมชนที่มีอยู่
 * Input :
 *   - communityId (number) : รหัสชุมชนที่ต้องการแก้ไข
 *   - community (CommunityDto) : ข้อมูลใหม่ของชุมชน
 * Output :
 *   - Object ของชุมชนที่อัปเดตแล้ว พร้อมความสัมพันธ์ทั้งหมด
 * หมายเหตุ :
 *   - ลบรูปภาพเก่าทั้งหมดแล้วสร้างใหม่ (deleteMany + create)
 *   - ลบสมาชิกเดิมแล้วเพิ่มใหม่จาก communityMembers
 */
export async function editCommunity(
  communityId: number,
  community: CommunityDto
) {
  const {
    location,
    adminId,
    communityImage,
    communityMembers,
    ...communityData
  } = community;

  return prisma.$transaction(async (transaction) => {
    const checkAdmin = await transaction.user.findFirst({
      where: { id: adminId, role: { name: "admin" } },
    });
    if (!checkAdmin) throw new Error("ผู้ใช้ไม่ใช่แอดมิน");

    const findCommunity = await transaction.community.findUnique({
      where: { id: communityId },
    });
    if (!findCommunity) throw new Error("ไม่พบชุมชน");

    const updateCommunity = await transaction.community.update({
      where: { id: communityId },
      data: {
        ...communityData,
        admin: {
          connect: { id: community.adminId },
        },
        location: { update: mapLocation(location) },
        communityImage: {
          deleteMany: {},
          create:
            communityImage?.map((img) => ({
              image: img.image,
              type: img.type,
            })) ?? [],
        },
      },
      include: {
        location: true,
        communityImage: true,
        admin: {
          select: { id: true, fname: true, lname: true },
        },
        communityMembers: {
          include: {
            user: { select: { id: true, fname: true, lname: true } },
          },
        },
      },
    });
    await transaction.communityMembers.deleteMany({
      where: { communityId },
    });
    if (community.communityMembers?.length) {
      await transaction.communityMembers.createMany({
        data: community.communityMembers.map((memberId) => ({
          communityId,
          memberId,
        })),
      });
    }
    return updateCommunity;
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบชุมชน (Soft Delete)
 * Input :
 *   - communityId (number) : รหัสของชุมชนที่ต้องการลบ
 * Output :
 *   - Object ของชุมชนที่ถูกเปลี่ยนสถานะ isDeleted = true
 * หมายเหตุ :
 *   - ไม่ลบข้อมูลจริงจากฐานข้อมูล แต่ตั้งค่าว่า "ลบแล้ว"
 */
export async function deleteCommunityById(communityId: number) {
  const findCommunity = await prisma.community.findUnique({
    where: { id: communityId, isDeleted: false },
  });
  if (!findCommunity) throw new Error("ไม่พบชุมชน");

  return await prisma.community.update({
    where: { id: communityId },
    data: { isDeleted: true, deleteAt: new Date() },
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายการชุมชนทั้งหมด (เฉพาะ SuperAdmin)
 * Input :
 *   - id (number) : รหัสผู้ใช้ที่ร้องขอ (ต้องเป็น SuperAdmin)
 *   - page (number) : หน้าปัจจุบัน
 *   - limit (number) : จำนวนต่อหน้า
 * Output :
 *   - PaginationResponse : ข้อมูลรายการชุมชนพร้อม pagination
 */
export const getCommunityAll = async (
  id: number,
  page = 1,
  limit = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(id)) throw new Error("ID must be Number");

  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role?.name !== "superadmin") {
    return {
      data: [],
      pagination: { currentPage: page, totalPages: 0, totalCount: 0, limit },
    };
  }

  const skip = (page - 1) * limit;
  const totalCount = await prisma.community.count({
    where: { isDeleted: false },
  });

  const communities = await prisma.community.findMany({
    where: { isDeleted: false },
    orderBy: { id: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      status: true,
      location: { select: { province: true } },
      admin: { select: { id: true, fname: true, lname: true } },
    },
  });

  return {
    data: communities,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
    },
  };
};

/*
 * คำอธิบาย : ดึงรายละเอียดของชุมชนแบบเต็ม (เฉพาะ SuperAdmin)
 * Input :
 *   - userId (number) : รหัสผู้ใช้
 *   - communityId (number) : รหัสชุมชนที่ต้องการดูรายละเอียด
 * Output :
 *   - Object ข้อมูลชุมชนพร้อมความสัมพันธ์ (location, member, image, store, homestay)
 * หมายเหตุ :
 *   - ตรวจสอบสิทธิ์ว่า user เป็น SuperAdmin เท่านั้น
 */
export async function getCommunityDetailById(
  userId: number,
  communityId: number
) {
  if (
    !Number.isInteger(userId) ||
    !Number.isInteger(communityId) ||
    userId <= 0 ||
    communityId <= 0
  )
    throw new Error("ID must be Number");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role?.name?.toLowerCase() !== "superadmin")
    throw new Error("Forbidden");

  const community = await prisma.community.findFirst({
    where: { id: communityId, isDeleted: false },
    include: {
      communityImage: true,
      location: true,

      packages: {
        include: {
          packageFile: true,
        },
      },
      homestays: {
        include: {
          homestayImage: true,
        },
      },

      stores: {
        include: {
          storeImage: true,
        },
      },
      communityMembers: {
        include: {
          user: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
              roleId: true,
            },
          },
        },
      },
    },
  });

  if (!community) throw new Error("Community not found");
  return community;
}

/*
 * คำอธิบาย : ดึงข้อมูลชุมชนตามรหัส (ใช้ในหน้าแก้ไขข้อมูล)
 * Input :
 *   - communityId (number) : รหัสของชุมชน
 * Output :
 *   - Object ข้อมูลชุมชนพร้อม location, image, admin, members
 */
export async function getCommunityById(communityId: number) {
  const community = await prisma.community.findFirst({
    where: { id: communityId, isDeleted: false },
    include: {
      location: true,
      communityImage: true,
      admin: { select: { id: true, fname: true, lname: true } },
      communityMembers: {
        include: { user: { select: { id: true, fname: true, lname: true } } },
      },
    },
  });
  if (!community) throw new Error("ไม่พบชุมชน");
  return community;
}

/*
 * คำอธิบาย : ดึงรายชื่อแอดมินที่ยังไม่ถูกผูกกับชุมชนใด
 * Output :
 *   - รายชื่อ admin (id, fname, lname)
 */
export async function getUnassignedAdmins() {
  const assignedAdmins = await prisma.community.findMany({
    where: { isDeleted: false },
    select: { adminId: true },
  });
  const assignedIds = assignedAdmins.map((community) => community.adminId);

  return await prisma.user.findMany({
    where: {
      role: { name: "admin" },
      id: { notIn: assignedIds },
      isDeleted: false,
    },
    select: { id: true, fname: true, lname: true },
    orderBy: { fname: "asc" },
  });
}

/*
 * คำอธิบาย : ดึงรายชื่อสมาชิกที่ยังไม่ถูกผูกกับชุมชน (ไม่นับชุมชนที่ถูกลบ)
 * Output :
 *   - รายชื่อ member (id, fname, lname)
 */

export async function getUnassignedMembers() {
  const deletedCommunityIds = (
    await prisma.community.findMany({
      where: { isDeleted: true },
      select: { id: true },
    })
  ).map((c) => c.id);

  const memberIds = await prisma.communityMembers.findMany({
    where: { communityId: { notIn: deletedCommunityIds } },
    select: { memberId: true },
  });
  const assignedIds = memberIds.map((member) => member.memberId);

  return await prisma.user.findMany({
    where: {
      role: { name: "member" },
      isDeleted: false,
      id: { notIn: assignedIds },
    },
    select: { id: true, fname: true, lname: true },
    orderBy: { fname: "asc" },
  });
}


/*
 * ฟังก์ชัน: getCommunityDetailByAdmin
 * คำอธิบาย: ดึงรายละเอียดชุมชนของ "แอดมินคนปัจจุบัน" (admin ของชุมชนนั้น)
 * Input:
 *   - userId (number): ผู้ใช้ที่เรียก (ต้องเป็น role=admin)
 * Output:
 *   - community + relations ของชุมชนที่ adminId = userId
 * Error:
 *   - "ID must be Number"
 *   - "User not found"
 *   - "Forbidden"
 *   - "Community not found"
 */
export async function getCommunityDetailByAdmin(userId: number) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("ID must be Number");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role?.name?.toLowerCase() !== "admin") {
    throw new Error("Forbidden");
  }

  const community = await prisma.community.findFirst({
    where: { adminId: userId, isDeleted: false },
     include: {
    communityImage: true,
    location: true,
    packages: true,
    homestays: true,
    stores: true,
    member: {
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        roleId: true,
        memberOfCommunity: true,
      }
    }
  },
});

  if (!community) throw new Error("Community not found");
  return community;
}

