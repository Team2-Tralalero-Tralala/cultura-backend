import prisma from "../database-service.js";
import type { PackageDto, PackageFileDto } from "./package-dto.js";

/*
 * คำอธิบาย : ฟังก์ชันสร้าง Package ใหม่ในระบบ
 * Input  : ข้อมูล PackageDto (communityId, overseerMemberId, location, name, ฯลฯ)
 * Output : ข้อมูล Package ที่ถูกสร้างใหม่
 */
export const createPackage = async (data: PackageDto) => {
  // ตรวจสอบว่า community มีจริง
  const community = await prisma.community.findUnique({
    where: { id: data.communityId }
  });

  if (!community) {
    throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
  }

  // ตรวจสอบว่า overseerMemberId มีจริง
  const overseer = await prisma.user.findUnique({
    where: { id: data.overseerMemberId }
  });
  if (!overseer) {
    throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);
  }

  // สร้าง location ใหม่
  const location = await prisma.location.create({
    data: {
      houseNumber: data.location.houseNumber,
      subDistrict: data.location.subDistrict,
      district: data.location.district,
      province: data.location.province,
      postalCode: data.location.postalCode,
      detail: data.location.detail,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    },
  });

  // สร้าง Package โดยผูกกับ location และเพิ่ม packageFile ถ้ามี
  return await prisma.package.create({
  data: {
    communityId: data.communityId,
    locationId: location.id,
    overseerMemberId: data.overseerMemberId,
    createById: data.createById,
    name: data.name,
    description: data.description,
    capacity: data.capacity,
    price: data.price,
    warning: data.warning,
    statusPackage: data.statusPackage,
    statusApprove: data.statusApprove,
    startDate: new Date(data.startDate),
    dueDate: new Date(data.dueDate),
    facility: data.facility,

    // ใช้ conditional spread แทน undefined
    ...(data.packageFile && {
      packageFile: {
        create: data.packageFile.map((file: any) => ({
          filePath: file.filePath,
          type: file.type,
        })),
      },
    }),
  },
  include: { location: true, packageFile: true },
});
};

/*
 * คำอธิบาย : ฟังก์ชันแก้ไขข้อมูล Package ที่มีอยู่
 * Input  : id (หมายเลข Package), data (ข้อมูล Package ที่แก้ไข)
 * Output : ข้อมูล Package ที่ถูกอัปเดต พร้อม location
 */
export const editPackage = async (id: number, data: any) => {
  // ตรวจสอบว่า package มีจริง
  const packageExist = await prisma.package.findUnique({
    where: { id },
    include: { location: true, packageFile: true }, // include packageFile ด้วย
  });
  if (!packageExist) {
    throw new Error(`Package ID ${id} ไม่พบในระบบ`);
  }

  // ตรวจสอบ communityId ถ้ามีการแก้ไข
  if (data.communityId) {
    const community = await prisma.community.findUnique({
      where: { id: data.communityId },
    });
    if (!community) {
      throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
    }
  }

  // ตรวจสอบ overseerMemberId ถ้ามีการแก้ไข
  if (data.overseerMemberId) {
    const overseer = await prisma.user.findUnique({
      where: { id: data.overseerMemberId },
    });
    if (!overseer) {
      throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);
    }
  }

  // แยก field ออกมา
  const { location, locationId, packageFile, ...packageData } = data;

  const result = await prisma.package.update({
    where: { id },
    data: {
      community: { connect: { id: data.communityId } },
      overseerPackage: { connect: { id: data.overseerMemberId } },
      createPackage: { connect: { id: data.createById } },

      name: data.name,
      description: data.description,
      capacity: data.capacity,
      price: data.price,
      warning: data.warning,
      statusPackage: data.statusPackage,
      statusApprove: data.statusApprove,
      startDate: new Date(data.startDate),
      dueDate: new Date(data.dueDate),
      facility: data.facility,

      location: {
        update: {
          houseNumber: location.houseNumber,
          subDistrict: location.subDistrict,
          district: location.district,
          province: location.province,
          postalCode: location.postalCode,
          detail: location.detail,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },

      // อัปเดต packageFile เฉพาะกรณีที่ส่งมา
      ...(packageFile && {
        packageFile: {
          deleteMany: {},
          create: packageFile.map((file: PackageFileDto) => ({
            filePath: file.filePath,
            type: file.type,
          })),
        },
      }),
    },
    include: { location: true, packageFile: true },
  });

  return result;
};


/*
 * คำอธิบาย : ดึง Package ตามหมายเลข ID
 * Input  : id (หมายเลข Package)
 * Output : รายการ Package ที่พบ (อาจเป็น array)
 */
export const getPackageByRole = async (id: number) => {
        if (!Number(id)){
          throw new Error(`Member ID ${id} ไม่พบในระบบ`);
        }
        const user = await prisma.user.findUnique({
            where: { id: id },
            include: { role: true, memberOf: true, communitiesAdmin: true }
        });
        let result: any;
        switch (user?.role.name) {
            case "superadmin": //superadmin
                result = await prisma.package.findMany({
                  skip: 0,
                  take: 10,
                });
                break;
            case "admin"://admin
                const adminCommunityIds = user.communitiesAdmin.map(c => c.id);
                result = await prisma.package.findMany({
                  where: { communityId: { in: adminCommunityIds } }
                });
                break;
            case "member": //member
                result = await prisma.package.findMany({
                  skip: 0,
                  take: 10,
                  where: { overseerMemberId: user.id }
                });
                break;
            case "tourist": //tourist
                result = await prisma.package.findMany({
                  skip: 0,
                  take: 10,
                  where: { statusApprove: "APPROVE", statusPackage: "PUBLISH" }
                });
                break;
            default:
                result = [];
        }
        /* ********************************************************** */
  return result;
};

/*
 * คำอธิบาย : ลบ Package ออกจากระบบ
 * Input  : id (หมายเลข Package)
 * Output : ข้อมูล Package ที่ถูกลบ
 */
export const deletePackage = async (userId: number, packageId: number) => {
  const user = await prisma.user.findUnique({
    where: {id: userId},
    include: { role: true, memberOf: true},
  });

  if(!user){
    throw new Error(`User ID ${userId} ไม่พบในระบบ`)
  }

  const packageExist = await prisma.package.findUnique({
    where: { id: packageId },
    include: { community: true }
  });

  if (!packageExist) {
    throw new Error(`Package ID ${packageId} ไม่พบในระบบ`);
  }
  switch (user.role.name) {
    case "superadmin":
      // superadmin ลบได้ทุกอย่าง
      break;
    case "admin":
      // admin ต้องเป็น admin ของ community นั้นเท่านั้น
      if (user.memberOfCommunity !== packageExist.communityId) {
        throw new Error("คุณไม่มีสิทธิ์ลบ Package ของชุมชนอื่น");
      }
      break;
    case "member":
      // member ต้องเป็น overseer ของ package เท่านั้น
      if (packageExist.overseerMemberId !== user.id) {
        throw new Error("คุณไม่มีสิทธิ์ลบ Package ที่คุณไม่ได้ดูแล");
      }
      break;
    default:
      throw new Error("คุณไม่มีสิทธิ์ลบ Package");
  }
  const deleted = await prisma.package.delete({
    where: { id: packageId },
  });

  return deleted;
};
