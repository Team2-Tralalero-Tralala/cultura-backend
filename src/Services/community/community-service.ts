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
  detail: loc.detail,
});
/*
 * คำอธิบาย : ฟังก์ชันสำหรับตรวจสอบว่าผู้ใช้ที่ระบุใน member ทั้งหมดเป็นสมาชิกที่ถูกต้องหรือไม่
 * Input : Array ของ member (รหัสผู้ใช้)
 * Output : ถ้าผู้ใช้ทั้งหมดถูกต้อง จะไม่มีการคืนค่าอะไร แต่ถ้ามีผู้ใช้ที่ไม่ถูกต้อง จะโยน Error ออกมา
 */
export async function checkMember(member: number[], communityId: number) {
  const checkMember = await prisma.user.findMany({
    where: {
      id: { in: member },
      role: {
        name: "member",
      },
      OR: [{ memberOfCommunity: null }, { memberOfCommunity: communityId }],
    },
  });

  if (checkMember.length !== member.length) {
    throw new Error(
      "Some users are not valid members or already in a community"
    );
  }
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
    bankAccount,
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
    if (!checkAdmin) throw new Error("User is not an admin");

    // check duplicate
    const findCommunity = await transaction.community.findFirst({
      where: {
        OR: [
          { name: community.name },
          { registerNumber: community.registerNumber },
        ],
      },
    });
    if (findCommunity) throw new Error("already have community");

    // create community
    const newCommunity = await transaction.community.create({
      data: {
        ...communityData,
        admin: { connect: { id: adminId } },
        bankAccount: {
          create: {
            bankName: bankAccount.bankName,
            accountName: bankAccount.accountName,
            accountNumber: bankAccount.accountNumber,
          },
        },
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
        ...(homestay?.length
          ? {
              homestays: {
                create: homestay
                  .filter((hs) => hs?.name && hs?.location)
                  .map((homestay) => ({
                    name: homestay.name,
                    roomType: homestay.roomType,
                    capacity: homestay.capacity,
                    facility: homestay.facility,
                    location: { create: mapLocation(homestay.location) },
                    homestayImage: {
                      create:
                        homestay.homestayImage?.map((img) => ({
                          image: img.image,
                          type: img.type,
                        })) ?? [],
                    },
                  })),
              },
            }
          : {}),
        ...(store?.length
          ? {
              stores: {
                create: store
                  .filter((st) => st?.name && st?.location)
                  .map((store) => ({
                    name: store.name,
                    detail: store.detail,
                    location: { create: mapLocation(store.location) },
                    storeImage: {
                      create:
                        store.storeImage?.map((img) => ({
                          image: img.image,
                          type: img.type,
                        })) ?? [],
                    },
                  })),
              },
            }
          : {}),
      },
      include: {
        location: true,
        homestays: true,
        communityImage: true,
        stores: true,
        admin: true,
        bankAccount: true,
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
    bankAccount,
    communityImage,
    member,
    ...communityData
  } = community;
  return prisma.$transaction(async (transaction) => {
    const checkAdmin = await transaction.user.findFirst({
      where: { id: adminId, role: { name: "admin" } },
    });
    if (!checkAdmin) throw new Error("User is not an admin");

    const findCommunity = await transaction.community.findUnique({
      where: { id: communityId },
    });
    if (!findCommunity) throw new Error("Community Not found");
    const updateCommunity = await transaction.community.update({
      where: { id: communityId },
      data: {
        ...communityData,
        ...(loc ? { location: { update: mapLocation(loc) } } : {}),

        admin: { connect: { id: adminId } },

        ...(bankAccount
          ? {
              bankAccount: {
                update: {
                  bankName: bankAccount.bankName,
                  accountName: bankAccount.accountName,
                  accountNumber: bankAccount.accountNumber,
                },
              },
            }
          : {}),
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
        homestays: true,
        communityImage: true,
        stores: true,
        admin: true,
        bankAccount: true,
      },
    });
    if (member?.length) {
      await checkMember(member, updateCommunity.id);
      const currentMembers = await transaction.user.findMany({
        where: {
          memberOfCommunity: updateCommunity.id,
          role: { name: "member" },
        },
        select: { id: true },
      });
      const currentMemberIds = currentMembers.map((m) => m.id);

      // 2. หาสมาชิกที่ถูกถอดออก (อยู่ใน current แต่ไม่อยู่ใน member ใหม่)
      const removedMembers = currentMemberIds.filter(
        (id) => !member.includes(id)
      );

      // อัปเดตสมาชิกที่ถูกถอดออก → set communityId = null
      if (removedMembers.length) {
        await transaction.user.updateMany({
          where: { id: { in: removedMembers } },
          data: { memberOfCommunity: null },
        });
      }

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
    where: { id: communityId },
  });
  if (!findCommunity) throw new Error("Community Not found");

  return await prisma.community.delete({
    where: { id: communityId },
  });
}
