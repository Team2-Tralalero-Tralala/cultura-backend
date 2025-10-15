import prisma from "../database-service.js";
import { CommunityDto } from "./community-dto.js";
import { LocationDto } from "../location/location-dto.js";

/*
 * คำอธิบาย : ฟังก์ชันช่วยแปลงข้อมูล LocationDto ให้อยู่ในรูปแบบที่สามารถใช้กับ Prisma ได้
 * Input : LocationDto (ข้อมูลที่อยู่ เช่น บ้านเลขที่ หมู่ที่ ซอย ตำบล อำเภอ จังหวัด รหัสไปรษณีย์ ละติจูด ลองจิจูด)
 * Output : Object ของ location ที่พร้อมนำไปใช้ใน Prisma create/update
 */
const mapLocation = (loc: LocationDto) => ({
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
 * คำอธิบาย : ฟังก์ชันสำหรับตรวจสอบว่าผู้ใช้ที่ระบุใน member ทั้งหมดเป็นสมาชิกที่ถูกต้องหรือไม่
 * Input : Array ของ member (รหัสผู้ใช้)
 * Output : ถ้าผู้ใช้ทั้งหมดถูกต้อง จะคืนค่า member ที่ตรวจสอบแล้ว
 * Error : throw error ถ้ามีผู้ใช้ที่ไม่ถูกต้อง (ไม่พบ หรือ ไม่ใช่บทบาท member)
 */
export async function checkMember(member: number[], communityId: number) {
  const validMembers = await prisma.user.findMany({
    where: {
      id: { in: member },
      role: {
        name: "member",
      },
      OR: [{ memberOfCommunity: null }, { memberOfCommunity: communityId }],
    },
    select: { id: true, fname: true, lname: true },
  });

  const validIds = validMembers.map((member) => member.id);

  const invalidMembers = await prisma.user.findMany({
    where: {
      id: { in: member.filter((id) => !validIds.includes(id)) },
    },
    select: {
      id: true,
      fname: true,
      lname: true,
    },
  });

  if (invalidMembers.length > 0) {
    throw {
      status: 400,
      message:
        "ไม่พบสมาชิกบางราย หรือ สมาชิกบางรายไม่ได้มีบทบาทเป็น member หรือสมาชิกนั้นมีชุมชนอยู่แล้ว",
      invalidMembers,
    };
  }

  return checkMember;
}

/**
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างข้อมูลชุมชนใหม่ พร้อมข้อมูลที่เกี่ยวข้อง เช่น location, homestay, store, member
 * Input :
 * - community : CommunityDto (ข้อมูลหลักของชุมชน เช่น ชื่อ เลขทะเบียน ประเภท ฯลฯ)
 * - location : LocationDto (ข้อมูลที่อยู่ของชุมชน)
 * - homestay : HomestayWithLocationDto หรือ Array (ข้อมูลโฮมสเตย์)
 * - store : StoreWithLocationDto หรือ Array (ข้อมูลร้านค้า)
 * - bankAccount : BankAccountDto (ข้อมูลบัญชีธนาคารของชุมชน)
 * - communityImage : CommunityImageDto หรือ Array (ข้อมูลรูปภาพของชุมชน)
 * - member : Array ของรหัสผู้ใช้ (สมาชิกของชุมชน)
 * Output : Community object ที่ถูกสร้างใหม่ พร้อม relation (location, homestays, stores, members)
 */
export async function createCommunity(community: CommunityDto) {
  const {
    location,
    homestay,
    store,
    adminId,
    communityImage,
    member,
    ...communityData
  } = community;

  return prisma.$transaction(async (transaction) => {
    // check admin
    const checkAdmin = await transaction.user.findFirst({
      where: { id: adminId, role: { name: "admin" } },
    });
    if (!checkAdmin) throw new Error("ผู้ใช้ไม่ใช่แอดมิน");

    // check duplicate
    const findCommunity = await transaction.community.findFirst({
      where: {
        OR: [
          { name: community.name },
          { registerNumber: community.registerNumber },
        ],
      },
    });
    if (findCommunity) throw new Error("มีชุมชนนี้อยู่แล้ว");

    // create community
    const newCommunity = await transaction.community.create({
      data: {
        ...communityData,
        admin: { connect: { id: adminId } },
        ...(communityImage?.length
          ? {
              communityImage: {
                create: communityImage.map((img) => ({
                  image: img.image,
                  type: img.type,
                })),
              },
            }
          : {}),
        location: { create: mapLocation(location) },
      },
      include: {
        location: true,
        communityImage: true,
        admin: {
          select: {
            id: true,
            fname: true,
            lname: true,
          },
        },
        member: {
          select: {
            id: true,
            fname: true,
            lname: true,
            memberOf: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (member?.length) {
      await checkMember(member, newCommunity.id);
      await transaction.user.updateMany({
        where: {
          id: { in: member },
          role: { name: "member" },
          memberOfCommunity: null,
        },
        data: { memberOfCommunity: newCommunity.id },
      });
    }

    return newCommunity;
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแก้ไขข้อมูลชุมชนที่มีอยู่ โดยใช้ communityId
 * Input :
 *   - communityId : number (รหัสของชุมชน)
 *   - community : updateCommunityFormDto (ข้อมูลชุมชนที่แก้ไข)
 * Output : Community object ที่ถูกแก้ไขเรียบร้อย
 */

export async function editCommunity(
  communityId: number,
  community: CommunityDto
) {
  const {
    location: loc,
    adminId,
    communityImage,
    member,
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
        ...(loc ? { location: { update: mapLocation(loc) } } : {}),

        admin: { connect: { id: adminId } },

        ...(communityImage && communityImage.length > 0
          ? {
              communityImage: {
                deleteMany: {},
                create: communityImage.map((img) => ({
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
        admin: {
          select: {
            id: true,
            fname: true,
            lname: true,
          },
        },
        member: {
          select: {
            id: true,
            fname: true,
            lname: true,
            memberOf: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    if (member?.length) {
      await checkMember(member, updateCommunity.id);
      // clear old member
      await transaction.user.updateMany({
        where: {
          memberOfCommunity: updateCommunity.id,
          role: { name: "member" },
        },
        data: { memberOfCommunity: null },
      });
      // set new member
      await transaction.user.updateMany({
        where: {
          id: { in: member },
          role: { name: "member" },
          OR: [
            { memberOfCommunity: null },
            { memberOfCommunity: updateCommunity.id },
          ],
        },
        data: { memberOfCommunity: updateCommunity.id },
      });
    }

    return updateCommunity;
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบข้อมูลชุมชนตาม communityId
 * Input : communityId (number)
 * Output : Community object ที่ถูกลบเรียบร้อย
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
        },
      },
    },
  });

  if (!community) throw new Error("Community not found");
  return community;
}
/*
 * คำอธิบาย : ดึงข้อมูลชุมชนตามรหัส (communityId)
 */
export async function getCommunityById(communityId: number) {
  const community = await prisma.community.findFirst({
    where: { id: communityId, isDeleted: false },
    include: {
      location: true,
      communityImage: true,
      admin: {
        select: {
          id: true,
          fname: true,
          lname: true,
        },
      },
      member: {
        select: {
          id: true,
          fname: true,
          lname: true,
          memberOf: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!community) throw new Error("ไม่พบชุมชน");

  return community;
}
/*
 * คำอธิบาย :  ดึงรายการแอดมินที่ยังไม่ถูกผูกกับชุมชนใด
 */
export async function getUnassignedAdmins() {
  const assignedAdmins = await prisma.community.findMany({
    select: {
      adminId: true,
    },
  });

  const assignedIds = assignedAdmins.map((c) => c.adminId);

  const admins = await prisma.user.findMany({
    where: {
      role: {
        name: "admin",
      },
      id: { notIn: assignedIds },
      isDeleted: false,
    },
    select: {
      id: true,
      fname: true,
      lname: true,
    },
    orderBy: { fname: "asc" },
  });
  return admins;
}
/*
 * คำอธิบาย : ดึงรายการสมาชิกที่ยังไม่ถูกผูกกับชุมชนใด
 */
export async function getUnassignedMembers() {
  const members = await prisma.user.findMany({
    where: {
      role: {
        name: "member",
      },
      memberOf: null,
      isDeleted: false,
    },
    select: {
      id: true,
      fname: true,
      lname: true,
    },
    orderBy: { fname: "asc" },
  });
  return members;
}
