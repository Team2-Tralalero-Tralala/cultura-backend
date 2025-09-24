import prisma from "../database-service.js";
import { CommunityDto, updateCommunityFormDto } from "./community-dto.js";
import { LocationDto, updateLocationDto } from "../location/location-dto.js";
import { HomestayWithLocationDto } from "../homestay/homestay-dto.js";
import { StoreWithLocationDto } from "../store/store-dto.js";
import { CommunityMemberDto } from "../community-member/community-member-dto.js";

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
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างข้อมูลชุมชนใหม่ พร้อมข้อมูลที่เกี่ยวข้อง เช่น location, homestay, store, member
 * Input :
 *   - community : CommunityDto (ข้อมูลหลักของชุมชน เช่น ชื่อ เลขทะเบียน ประเภท ฯลฯ)
 *   - location : LocationDto (ข้อมูลที่อยู่ของชุมชน)
 *   - homestay : HomestayWithLocationDto หรือ Array (ข้อมูลโฮมสเตย์)
 *   - store : StoreWithLocationDto หรือ Array (ข้อมูลร้านค้า)
 *   - communityMember : CommunityMemberDto หรือ Array (ข้อมูลสมาชิกของชุมชน)
 * Output : Community object ที่ถูกสร้างใหม่ พร้อม relation (location, homestays, stores, members)
 */
export async function createCommunity(
  community: CommunityDto,
  location: LocationDto,
  homestay: HomestayWithLocationDto | HomestayWithLocationDto[],
  store: StoreWithLocationDto | StoreWithLocationDto[],
  communityMember: CommunityMemberDto | CommunityMemberDto[]
) {
  const homestayList = Array.isArray(homestay) ? homestay : [homestay];
  const storeList = Array.isArray(store) ? store : [store];
  const communityMemberList = Array.isArray(communityMember)
    ? communityMember
    : [communityMember];

  const findCommunity = await prisma.community.findFirst({
    where: {
      OR: [
        { name: community.name },
        { registerNumber: community.registerNumber },
      ],
    },
  });
  if (findCommunity) throw new Error("already have community");
  return prisma.community.create({
    data: {
      ...community,
      alias: community.alias ?? null,
      mainAdmin: community.mainAdmin ?? null,
      mainAdminPhone: community.mainAdminPhone ?? null,
      coordinatorName: community.coordinatorName ?? null,
      coordinatorPhone: community.coordinatorPhone ?? null,
      urlWebsite: community.urlWebsite ?? null,
      urlFacebook: community.urlFacebook ?? null,
      urlLine: community.urlLine ?? null,
      urlTiktok: community.urlTiktok ?? null,
      urlOther: community.urlOther ?? null,

      location: { create: mapLocation(location) },

      ...(homestayList?.length
        ? {
            homestays: {
              create: homestayList
                .filter((homestay) => homestay?.name && homestay?.location)
                .map((homestay) => ({
                  name: homestay.name,
                  roomType: homestay.roomType,
                  capacity: homestay.capacity,
                  location: { create: mapLocation(homestay.location) },
                })),
            },
          }
        : {}),

      ...(storeList?.length
        ? {
            stores: {
              create: storeList
                .filter((store) => store?.name && store?.location)
                .map((store) => ({
                  name: store.name,
                  detail: store.detail,
                  location: { create: mapLocation(store.location) },
                })),
            },
          }
        : {}),

      members: {
        create: communityMemberList.map((member) => ({
          memberId: member.memberId,
          roleId: member.roleId,
        })),
      },
    },
    include: { location: true, homestays: true, stores: true, members: true },
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแก้ไขข้อมูลชุมชนที่มีอยู่ โดยใช้ communityId
 * Input :
 *   - communityId : number (รหัสของชุมชน)
 *   - community : updateCommunityFormDto (ข้อมูลชุมชนที่แก้ไข)
 *   - location : updateLocationDto (ข้อมูลที่อยู่ ถ้ามี)
 * Output : Community object ที่ถูกแก้ไขเรียบร้อย
 */

export async function editCommunity(
  communityId: number,
  community: updateCommunityFormDto,
  location?: updateLocationDto
) {
  const findCommunity = await prisma.community.findUnique({
    where: { id: communityId },
  });
  if (!findCommunity) throw new Error("Community Not found");

  return prisma.community.update({
    where: { id: communityId },
    data: {
      name: community.name,
      alias: community.alias ?? null,
      type: community.type,
      registerNumber: community.registerNumber,
      registerDate: community.registerDate,
      description: community.description,
      mainActivityName: community.mainActivityName,
      mainActivityDescription: community.mainActivityDescription,
      status: community.status,
      phone: community.phone,
      rating: community.rating,
      email: community.email,
      bank: community.bank,
      bankAccountName: community.bankAccountName,
      bankAccountNumber: community.bankAccountNumber,

      mainAdmin: community.mainAdmin ?? null,
      mainAdminPhone: community.mainAdminPhone ?? null,
      coordinatorName: community.coordinatorName ?? null,
      coordinatorPhone: community.coordinatorPhone ?? null,
      urlWebsite: community.urlWebsite ?? null,
      urlFacebook: community.urlFacebook ?? null,
      urlLine: community.urlLine ?? null,
      urlTiktok: community.urlTiktok ?? null,
      urlOther: community.urlOther ?? null,

      ...(location ? { location: { update: mapLocation(location) } } : {}),
    },
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
