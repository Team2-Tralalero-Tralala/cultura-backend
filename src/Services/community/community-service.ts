import prisma from "../database-service.js";
import { CommunityDto } from "./community-dto.js";
import { LocationDto } from "../location/location-dto.js";
import type { PaginationResponse } from "../pagination-dto.js";

/*
 * ฟังก์ชันช่วยแปลง LocationDto → Prisma object
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
 * ตรวจสอบว่า member ที่ส่งมามีอยู่จริงและมี role = member
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
    const foundIds = members.map((m) => m.id);
    const invalidIds = memberIds.filter((id) => !foundIds.includes(id));
    throw {
      status: 400,
      message: "มีสมาชิกบางรายไม่ถูกต้อง หรือไม่ใช่ role: member",
      invalidIds,
    };
  }

  return members;
}

/*
 * ฟังก์ชันสร้างชุมชนใหม่
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

    console.log(communityMembers);
    return newCommunity;
  });
}

/*
 * ฟังก์ชันแก้ไขชุมชน
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
          create: communityImage?.map((img) => ({
            image: img.image,
            type: img.type,
          })),
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
 * ฟังก์ชันลบชุมชน (soft delete)
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
 * ฟังก์ชันดึงรายการชุมชนทั้งหมด (เฉพาะ superadmin)
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
 * ดึงรายละเอียดชุมชนแบบเต็ม (เฉพาะ superadmin)
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
      packages: true,
      homestays: true,
      stores: true,
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
 * ดึงข้อมูลชุมชนตามรหัส
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
 * ดึงรายการแอดมินที่ยังไม่ถูกผูกกับชุมชน
 */
export async function getUnassignedAdmins() {
  const assignedAdmins = await prisma.community.findMany({
    where: { isDeleted: false },
    select: { adminId: true },
  });
  const assignedIds = assignedAdmins.map((c) => c.adminId);

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
 * ดึงสมาชิกที่ยังไม่ถูกผูกกับชุมชนใด (ไม่นับชุมชนที่ถูกลบ)
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
  const assignedIds = memberIds.map((m) => m.memberId);

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
