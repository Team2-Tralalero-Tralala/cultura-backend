import prisma from "./database-service.js";
import type { PackageDto } from "./package/package-dto.js";

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

  // สร้าง Package โดยผูกกับ location ที่เพิ่งสร้าง
  return await prisma.package.create({
    data: {
      communityId: data.communityId,
      locationId: location.id,
      overseerMemberId: data.overseerMemberId,
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
    },
  });
};

/*
 * คำอธิบาย : ฟังก์ชันแก้ไขข้อมูล Package ที่มีอยู่
 * Input  : id (หมายเลข Package), data (ข้อมูล Package ที่แก้ไข)
 * Output : ข้อมูล Package ที่ถูกอัปเดต พร้อม location
 */
export const editPackage = async (id: number, data: any) => {
  // ตรวจสอบว่า package มีจริง
  const pkg = await prisma.package.findUnique({
    where: { id },
    include: { location: true },
  });
  if (!pkg) {
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

  // ตรวจสอบ locationId ถ้ามีการแก้ไข
  if (data.locationId) {
    if (data.locationId !== pkg.locationId) {
      throw new Error(`ไม่สามารถเปลี่ยน Location ID ของ Package ${id} ได้`);
    }
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    });
    if (!location) {
      throw new Error(`Location ID ${data.locationId} ไม่พบในระบบ`);
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

  // แยก location ออกมา (แก้ field ได้ แต่ห้ามเปลี่ยน locationId)
  const { location, locationId, ...packageData } = data;

  return await prisma.package.update({
    where: { id },
    data: {
      ...packageData,
      ...(location
        ? {
            location: {
              update: { ...location }, // update fields ของ location เดิม
            },
          }
        : {}),
    },
    include: { location: true },
  });
};

/*
 * คำอธิบาย : ดึง Package ตามหมายเลข ID
 * Input  : id (หมายเลข Package)
 * Output : รายการ Package ที่พบ (อาจเป็น array)
 */
export const getPackageByRole = async (id: number) => {
  return await prisma.package.findMany({
    where: { id: id }
  });
};

/*
 * คำอธิบาย : ดึง Package ตาม overseerMemberId
 * Input  : id (หมายเลข Member)
 * Output : รายการ Package ที่ overseer รับผิดชอบ
 */
export const getPackageByMemberID = async (id: number) => {
  return await prisma.package.findMany({
    where: { overseerMemberId: id }
  });
};

/*
 * คำอธิบาย : ลบ Package ออกจากระบบ
 * Input  : id (หมายเลข Package)
 * Output : ข้อมูล Package ที่ถูกลบ
 */
export const deletePackage = async (id: number) => {
  // ตรวจสอบว่า package มีจริงก่อนลบ
  const pkg = await prisma.package.findUnique({ where: { id } });
  if (!pkg) {
    throw new Error(`Package ID ${id} ไม่พบในระบบ`);
  }
  return await prisma.package.delete({
    where: { id: id }
  });
};
