import prisma from "./database-service.js";
import type { PackageDto } from "./package/package-dto.js";

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

  // ✅ ใช้ location.create แทน locationId
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

  // 2. สร้าง Package โดยใช้ location.id ที่เพิ่งสร้าง
  return await prisma.package.create({
    data: {
      communityId: data.communityId,
      locationId: location.id,   // 👈 ใช้ id ที่เพิ่งสร้าง
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


export const editPackage = async (id: number, data: any) => {
  // ตรวจสอบว่า package ที่จะแก้มีจริง
  const pkg = await prisma.package.findUnique({
    where: { id },
    include: { location: true },
  });
  if (!pkg) {
    throw new Error(`Package ID ${id} ไม่พบในระบบ`);
  }

  // ถ้ามีการแก้ communityId → ตรวจสอบว่า community นั้นมีจริง
  if (data.communityId) {
    const community = await prisma.community.findUnique({
      where: { id: data.communityId },
    });
    if (!community) {
      throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
    }
  }

  // ถ้ามีการแก้ locationId → ต้องเป็นของ package เดิมเท่านั้น
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

  // ถ้ามีการแก้ overseerMemberId → ตรวจสอบว่า member นั้นมีจริง
  if (data.overseerMemberId) {
    const overseer = await prisma.user.findUnique({
      where: { id: data.overseerMemberId },
    });
    if (!overseer) {
      throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);
    }
  }

  // แยก location ออกมา (ห้ามเปลี่ยน locationId แต่แก้รายละเอียดได้)
  const { location, locationId, ...packageData } = data;

  return await prisma.package.update({
    where: { id },
    data: {
      ...packageData,
      ...(location
        ? {
            location: {
              update: { ...location }, // ✅ Prisma จะ update fields ของ location เดิม
            },
          }
        : {}),
    },
    include: { location: true },
  });
};



export const getPackageByRole = async (id: number) => {
    return await prisma.package.findMany({
        where: { id: id }
    })
}

export const getPackageByMemberID = async (id: number) => {
    return await prisma.package.findMany({
        where: { overseerMemberId: id }
    });
};

export const deletePackage = async (id: number) => {

    // ตรวจสอบว่า package ที่จะลบมีจริง
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (!pkg) {
        throw new Error(`Package ID ${id} ไม่พบในระบบ`);
    }
    return await prisma.package.delete({
        where: { id: id }
    });
};
