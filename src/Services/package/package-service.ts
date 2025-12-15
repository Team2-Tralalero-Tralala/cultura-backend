// Services/package/package-service.ts
import { PackageApproveStatus, PackagePublishStatus } from "@prisma/client";
import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";
import type { PackageDto, PackageFileDto } from "./package-dto.js";

/* ============================================================================================
 * Helpers (เก็บเฉพาะที่จำเป็น)
 * ============================================================================================ */

/*
 * คำอธิบาย : แปลงค่า undefined หรือ null เป็น null
 * Input: value - ค่าที่อาจเป็น undefined หรือ null
 * Output : ค่าเดิม หรือ null
 */
const toNull = <T>(value: T | undefined | null): T | null => value ?? null;

/*
 * คำอธิบาย : สร้างเงื่อนไข (where clause) สำหรับ Prisma โดยอิงตามบทบาท (role) ของผู้ใช้
 * Input: user - object ผู้ใช้ที่มีข้อมูล role และ community
 * Output : object เงื่อนไข where สำหรับ Prisma
 */
function buildWhereForRole(user: any): any {
  const base = { isDeleted: false, statusPackage: { not: 'DRAFT' } };
  switch (user?.role?.name) {
    case "superadmin":
      return base;
    case "admin": {
      const adminCommunityIds = user.communityAdmin.map(
        (community: any) => community.id
      );
      return { ...base, communityId: { in: adminCommunityIds } };
    }
    case "member":
      return { ...base, overseerMemberId: user.id };
    case "tourist":
      return { ...base, statusApprove: "APPROVE", statusPackage: "PUBLISH" };
    default:
      // หาไม่เจออะไร
      return { id: -1 };
  }
}

/*
 * คำอธิบาย : รวมสตริงวันที่ (dateStr) และเวลา (timeStr) เป็น Date object
 * Input: dateStr - "yyyy-mm-dd", timeStr - "HH:mm" (optional), useEndOfDayIfMissing - (optional)
 * Output : Date object
 */
function composeDateTimeIso(
  dateStr: string, // "yyyy-mm-dd"
  timeStr?: string, // "HH:mm"
  useEndOfDayIfMissing = false
): Date {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`Invalid dateStr: ${dateStr}`);
  }

  const timeFormat =
    timeStr && /^\d{2}:\d{2}$/.test(timeStr)
      ? timeStr
      : useEndOfDayIfMissing
        ? "23:59"
        : "00:00";

  // ทำเป็น "YYYY-MM-DDTHH:mm:ss" (ไม่มี Z ⇒ ตีความเป็น local)
  const isoLocal = `${dateStr}T${timeFormat}:${useEndOfDayIfMissing && !timeStr ? "59" : "00"
    }`;
  return new Date(isoLocal);
}

/* ============================================================================================
 * Create
 * ============================================================================================ */

/*
 * คำอธิบาย : สร้างแพ็กเกจใหม่ในระบบ
 * Input: data - ข้อมูล PackageDto
 * Output : ข้อมูลแพ็กเกจที่สร้างเสร็จ พร้อม location และ packageFile
 */
export const createPackage = async (data: PackageDto) => {
  // ตรวจ community (ถ้ามีส่งมา)
  if (data.communityId !== undefined && data.communityId !== null) {
    const community = await prisma.community.findUnique({
      where: { id: Number(data.communityId) },
    });
    if (!community)
      throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
  }

  const targetOverseerId = data.overseerMemberId ?? data.createById;

  if (!targetOverseerId) {
    throw new Error("ไม่สามารถระบุตัวตนผู้ดูแลแพ็กเกจได้ (Missing ID)");
  }
  const overseer = await prisma.user.findUnique({
    where: { id: Number(targetOverseerId) }, // ใช้ตัวแปร targetOverseerId แทน
    include: { communityMembers: { include: { Community: true } }, communityAdmin: true, },
  });
  if (!overseer)
    throw new Error(`Member ID ${targetOverseerId} ไม่พบในระบบ`);
  const resolvedCommunityId = data.communityId ?? overseer.communityMembers[0]?.Community?.id ?? overseer.communityAdmin[0]?.id ?? null;
  if (!resolvedCommunityId) {
    throw new Error("ไม่พบชุมชนของผู้ดูแล แพ็กเกจต้องสังกัดชุมชน");
  }

  // สร้าง Location
  const hasValidLocation =
    data.location &&
    data.location.houseNumber &&
    data.location.subDistrict &&
    data.location.district &&
    data.location.province &&
    data.location.postalCode;

  let locationId: number | null = null;

  if (hasValidLocation) {
    const location = await prisma.location.create({
      data: {
        houseNumber: data.location.houseNumber,
        villageNumber: toNull(data.location.villageNumber),
        alley: toNull(data.location.alley),
        subDistrict: data.location.subDistrict,
        district: data.location.district,
        province: data.location.province,
        postalCode: data.location.postalCode,
        detail: toNull(data.location.detail),
        latitude: Number(data.location.latitude) || 0,
        longitude: Number(data.location.longitude) || 0,
      },
    });
    locationId = location.id;
  }

const startAt = data.startDate
    ? composeDateTimeIso(data.startDate, (data as any).startTime)
    : null;

  const dueAt = data.dueDate
    ? composeDateTimeIso(data.dueDate, (data as any).endTime, true)
    : null;

  const openBooking = data.bookingOpenDate
    ? composeDateTimeIso(data.bookingOpenDate, (data as any).openTime)
    : null;

  const closeBooking = data.bookingCloseDate
    ? composeDateTimeIso(data.bookingCloseDate, (data as any).closeTime, true)
    : null;

  const homestayCheckIn =
    data.homestayId && data.homestayCheckInDate
      ? composeDateTimeIso(data.homestayCheckInDate, data.homestayCheckInTime)
      : undefined;

  const homestayCheckOut =
    data.homestayId && data.homestayCheckOutDate
      ? composeDateTimeIso(
        data.homestayCheckOutDate,
        data.homestayCheckOutTime,
        true
      )
      : undefined;

  const hasHomestayLink =
    data.homestayId && homestayCheckIn && homestayCheckOut;

  return prisma.package.create({
    data: {
      communityId: Number(resolvedCommunityId),
      locationId: locationId, // ใช้ตัวแปรที่คำนวณไว้ข้างบน (อาจเป็น null)
      overseerMemberId: Number(targetOverseerId),
      createById: data.createById ?? Number(targetOverseerId),
      name: data.name,
      
      // เพิ่ม || null หรือ ?? null เพื่อรองรับกรณีไม่มีข้อมูล
      description: data.description || null, 
      capacity: data.capacity ?? null,       
      price: data.price ?? null,             
      warning: data.warning || null,
      
      statusPackage: data.statusPackage,
      statusApprove: data.statusApprove,
      startDate: startAt,
      dueDate: dueAt,
      bookingOpenDate: openBooking,
      bookingCloseDate: closeBooking,
      
      facility: data.facility || null, // เพิ่ม || null

      // ... (ส่วน packageFile และ homestayHistories เหมือนเดิมไม่ต้องแก้)
      ...(Array.isArray((data as any).packageFile) &&
      (data as any).packageFile.length > 0
        ? {
            packageFile: {
              create: (data as any).packageFile.map((file: PackageFileDto) => ({
                filePath: file.filePath,
                type: file.type,
              })),
            },
          }
        : {}),
      ...(hasHomestayLink
        ? {
            homestayHistories: {
              create: {
                homestayId: Number(data.homestayId),
                bookedRoom: Number((data as any).bookedRoom || 1),
                checkInTime: homestayCheckIn!,
                checkOutTime: homestayCheckOut!,
              },
            },
          }
        : {}),
    },
    include: { location: true, packageFile: true, homestayHistories: true },
  });
};

type DuplicatePackageInput = {
  packageId: number;
  userId: number;
};

/*
 * คำอธิบาย : คัดลอกแพ็กเกจจากประวัติ และสร้างแพ็กเกจใหม่ในสถานะ Draft
 * Input: packageId - ID ของแพ็กเกจต้นฉบับ, userId - ID ของผู้ดูแล (Admin) ที่ดำเนินการ
 * Output : ข้อมูลแพ็กเกจใหม่ที่ถูกคัดลอก
 */
export async function duplicatePackageFromHistory({
  packageId,
  userId,
}: DuplicatePackageInput) {
  if (!Number.isInteger(packageId) || packageId <= 0) {
    throw new Error("Package ID must be a positive integer");
  }
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("User ID must be a positive integer");
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: { select: { name: true } },
      communityAdmin: { select: { id: true } },
    },
  });

  if (!adminUser) {
    throw new Error("User not found");
  }
  if (adminUser.role?.name !== "admin") {
    throw new Error("เฉพาะผู้ดูแล (Admin) เท่านั้นที่สามารถคัดลอกแพ็กเกจได้");
  }

  const adminCommunityIds = adminUser.communityAdmin.map(
    (community) => community.id
  );

  return prisma.$transaction(async (transaction) => {
    const sourcePackage = await transaction.package.findFirst({
      where: { id: packageId, isDeleted: false },
      include: {
        location: true,
        packageFile: true,
        tagPackages: true,
        homestayHistories: true,
      },
    });

    if (!sourcePackage) {
      throw new Error("ไม่พบแพ็กเกจที่ต้องการคัดลอก");
    }
    if (!adminCommunityIds.includes(sourcePackage.communityId)) {
      throw new Error("คุณไม่มีสิทธิ์คัดลอกแพ็กเกจของชุมชนอื่น");
    }

    if (!sourcePackage.location) {
      throw new Error("แพ็กเกจไม่มีข้อมูลสถานที่สำหรับคัดลอก");
    }

    const clonedLocation = await transaction.location.create({
      data: {
        houseNumber: sourcePackage.location.houseNumber,
        villageNumber: toNull(sourcePackage.location.villageNumber),
        alley: toNull(sourcePackage.location.alley),
        subDistrict: sourcePackage.location.subDistrict,
        district: sourcePackage.location.district,
        province: sourcePackage.location.province,
        postalCode: sourcePackage.location.postalCode,
        detail: toNull(sourcePackage.location.detail),
        latitude: sourcePackage.location.latitude,
        longitude: sourcePackage.location.longitude,
      },
    });

    const duplicatedPackage = await transaction.package.create({
      data: {
        communityId: sourcePackage.communityId,
        locationId: clonedLocation.id,
        overseerMemberId: sourcePackage.overseerMemberId,
        createById: userId,
        name: sourcePackage.name,
        description: sourcePackage.description,
        capacity: sourcePackage.capacity,
        price: sourcePackage.price,
        warning: sourcePackage.warning,
        statusPackage: PackagePublishStatus.DRAFT,
        statusApprove: PackageApproveStatus.PENDING,
        startDate: sourcePackage.startDate,
        dueDate: sourcePackage.dueDate,
        bookingOpenDate: sourcePackage.bookingOpenDate,
        bookingCloseDate: sourcePackage.bookingCloseDate,
        facility: sourcePackage.facility,
        ...(sourcePackage.packageFile.length
          ? {
            packageFile: {
              create: sourcePackage.packageFile.map((file) => ({
                filePath: file.filePath,
                type: file.type,
              })),
            },
          }
          : {}),
        ...(sourcePackage.tagPackages.length
          ? {
            tagPackages: {
              create: sourcePackage.tagPackages.map((tag) => ({
                tagId: tag.tagId,
              })),
            },
          }
          : {}),
        ...(sourcePackage.homestayHistories.length
          ? {
            homestayHistories: {
              create: sourcePackage.homestayHistories.map((history) => ({
                homestayId: history.homestayId,
                bookedRoom: history.bookedRoom,
                checkInTime: history.checkInTime,
                checkOutTime: history.checkOutTime,
              })),
            },
          }
          : {}),
      },
      include: {
        location: true,
        packageFile: true,
        tagPackages: true,
        homestayHistories: true,
      },
    });

    return duplicatedPackage;
  });
}

/* ============================================================================================
 * Edit (อัปเดตเฉพาะสิ่งที่ส่งมา, กัน undefined)
 * ============================================================================================ */

/*
 * คำอธิบาย : แก้ไขข้อมูลแพ็กเกจ
 * Input: id - ID ของแพ็กเกจ, data - ข้อมูล (any) ที่ต้องการอัปเดต
 * Output : ข้อมูลแพ็กเกจที่อัปเดตแล้ว
 */
export const editPackage = async (id: number, data: any) => {
  const foundPackage = await prisma.package.findUnique({
    where: { id },
    include: { location: true, packageFile: true },
  });
  if (!foundPackage) throw new Error(`Package ID ${id} ไม่พบในระบบ`);

  if (data.communityId !== undefined && data.communityId !== null) {
    const community = await prisma.community.findUnique({
      where: { id: Number(data.communityId) },
    });
    if (!community)
      throw new Error(`Community ID ${data.communityId} ไม่พบในระบบ`);
  }
  if (data.overseerMemberId !== undefined && data.overseerMemberId !== null) {
    const overseer = await prisma.user.findUnique({
      where: { id: Number(data.overseerMemberId) },
    });
    if (!overseer)
      throw new Error(`Member ID ${data.overseerMemberId} ไม่พบในระบบ`);
  }

  // recompute วัน-เวลา (Package)
  const startAt = data.startDate
    ? composeDateTimeIso(data.startDate, data.startTime)
    : foundPackage.startDate;

  const dueAt = data.dueDate
    ? composeDateTimeIso(data.dueDate, data.endTime, true)
    : foundPackage.dueDate;

  const openBooking = data.bookingOpenDate
    ? composeDateTimeIso(data.bookingOpenDate, data.openTime)
    : foundPackage.bookingOpenDate;

  const closeBooking = data.bookingCloseDate
    ? composeDateTimeIso(data.bookingCloseDate, data.closeTime, true)
    : foundPackage.bookingCloseDate;

  // [เพิ่ม] แปลงวันเวลาของ Homestay (ถ้ามี)
  const homestayCheckIn =
    data.homestayId && data.homestayCheckInDate
      ? composeDateTimeIso(data.homestayCheckInDate, data.homestayCheckInTime)
      : undefined;

  const homestayCheckOut =
    data.homestayId && data.homestayCheckOutDate
      ? composeDateTimeIso(
        data.homestayCheckOutDate,
        data.homestayCheckOutTime,
        true
      )
      : undefined;

  const hasHomestayLink =
    data.homestayId && homestayCheckIn && homestayCheckOut && data.bookedRoom;

  const updateData: any = {
    ...(data.communityId !== undefined && {
      community: { connect: { id: Number(data.communityId) } },
    }),
    ...(data.overseerMemberId !== undefined && {
      overseerPackage: { connect: { id: Number(data.overseerMemberId) } },
    }),

    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.capacity !== undefined && { capacity: Number(data.capacity) }),
    ...(data.price !== undefined && { price: Number(data.price) }),
    ...(data.warning !== undefined && { warning: data.warning }),
    ...(data.statusPackage !== undefined && {
      statusPackage: data.statusPackage,
    }),
    ...(data.statusApprove !== undefined && {
      statusApprove: data.statusApprove,
    }),
    ...(startAt !== undefined && { startDate: startAt }),
    ...(dueAt !== undefined && { dueDate: dueAt }),
    ...(data.facility !== undefined && { facility: data.facility }),
    ...(data.bookingOpenDate !== undefined && { bookingOpenDate: openBooking }),
    ...(data.bookingCloseDate !== undefined && {
      bookingCloseDate: closeBooking,
    }),
  };

  if (data.location) {
    const locationData = data.location;
    updateData.location = {
      upsert: {
        create: {
            houseNumber: locationData.houseNumber || "",
            villageNumber: toNull(locationData.villageNumber),
            alley: toNull(locationData.alley),
            subDistrict: locationData.subDistrict || "",
            district: locationData.district || "",
            province: locationData.province || "",
            postalCode: locationData.postalCode || "",
            detail: toNull(locationData.detail),
            latitude: Number(locationData.latitude) || 0,
            longitude: Number(locationData.longitude) || 0,
        },
        update: {
          ...(locationData.houseNumber !== undefined && {
            houseNumber: locationData.houseNumber,
          }),
          ...(locationData.villageNumber !== undefined && {
            villageNumber: toNull(locationData.villageNumber),
          }),
          ...(locationData.alley !== undefined && {
            alley: toNull(locationData.alley),
          }),
          ...(locationData.subDistrict !== undefined && {
            subDistrict: locationData.subDistrict,
          }),
          ...(locationData.district !== undefined && {
            district: locationData.district,
          }),
          ...(locationData.province !== undefined && {
            province: locationData.province,
          }),
          ...(locationData.postalCode !== undefined && {
            postalCode: locationData.postalCode,
          }),
          ...(locationData.detail !== undefined && {
            detail: toNull(locationData.detail),
          }),
          ...(locationData.latitude !== undefined && {
            latitude: Number(locationData.latitude),
          }),
          ...(locationData.longitude !== undefined && {
            longitude: Number(locationData.longitude),
          }),
        },
      },
    };
  }

  // อัปเดตไฟล์แบบ replace เฉพาะเมื่อส่งมา
  if (Array.isArray(data.packageFile)) {
    updateData.packageFile = {
      deleteMany: {},
      create: (data.packageFile as PackageFileDto[]).map((file) => ({
        filePath: file.filePath,
        type: file.type,
      })),
    };
  }

  // [เพิ่ม] Logic การอัปเดต Homestay (แบบลบของเก่า-สร้างใหม่)
  // เราใช้ 'data.homestayId !== undefined' เพื่อเช็กว่ามีการส่งข้อมูลส่วนนี้มา
  if (data.homestayId !== undefined) {
    updateData.homestayHistories = {
      deleteMany: {}, // ลบประวัติ Homestay ที่ผูกกับ Package นี้ทั้งหมด
      ...(hasHomestayLink // ถ้าข้อมูลใหม่ครบถ้วน (มี ID, วันที่, ห้อง)
        ? {
          create: {
            // สร้างประวัติใหม่
            homestayId: Number(data.homestayId),
            bookedRoom: Number(data.bookedRoom),
            checkInTime: homestayCheckIn!,
            checkOutTime: homestayCheckOut!,
          },
        }
        : {}), // ถ้าข้อมูลไม่ครบ (เช่น กดลบ Homestay) ก็จะไม่สร้างใหม่
    };
  }

  return prisma.package.update({
    where: { id },
    data: updateData,
    include: { location: true, packageFile: true, homestayHistories: true },
  });
};

/* ============================================================================================
 * Get list by role (ใช้ userId จาก token ฝั่ง controller)
 * ============================================================================================ */

/*
 * คำอธิบาย : ดึงรายการแพ็กเกจตามบทบาท (role) ของผู้ใช้
 * Input: userId - ID ของผู้ใช้, page - เลขหน้า, limit - จำนวนต่อหน้า
 * Output : ข้อมูลแพ็กเกจพร้อม Pagination
 */
export const getPackageByRole = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginationResponse<any>> => {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: {
      role: true,
      communityMembers: { include: { Community: true } },
      communityAdmin: true,
    },
  });
  if (!user) throw new Error(`Member ID ${userId} ไม่ถูกต้อง`);

  const whereCondition = buildWhereForRole(user);

  const skip = (page - 1) * limit;
  const totalCount = await prisma.package.count({ where: whereCondition });

  const packages = await prisma.package.findMany({
    where: whereCondition,
    include: {
      community: true,
      location: true,
      overseerPackage: {
        select: {
          id: true,
          username: true,
          fname: true,
          lname: true,
          email: true,
        },
      },
    },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);
  return {
    data: packages,
    pagination: { currentPage: page, totalPages, totalCount, limit },
  };
};

/* ============================================================================================
 * Soft delete (เช็คสิทธิ์แบบง่ายตาม role)
 * ============================================================================================ */

/*
 * คำอธิบาย : ลบแพ็กเกจ (Soft Delete)
 * Input: currentUserId - ID ของผู้ใช้ที่กำลังดำเนินการ, packageId - ID ของแพ็กเกจที่ต้องการลบ
 * Output : ข้อมูลแพ็กเกจที่ถูกอัปเดต (isDeleted: true)
 */
export const deletePackage = async (
  currentUserId: number,
  packageId: number
) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(currentUserId) },
    include: { role: true, communityAdmin: true },
  });
  if (!user) throw new Error(`User ID ${currentUserId} ไม่พบในระบบ`);

  const foundPackage = await prisma.package.findUnique({
    where: { id: Number(packageId) },
  });
  if (!foundPackage) throw new Error(`Package ID ${packageId} ไม่พบในระบบ`);

  const role = user.role?.name;
  if (role === "admin") {
    const adminCommunityIds = user.communityAdmin.map(
      (community) => community.id
    );
    if (!adminCommunityIds.includes(foundPackage.communityId)) {
      throw new Error("คุณไม่มีสิทธิ์ลบ Package ของชุมชนอื่น");
    }
  } else if (role === "member") {
    if (foundPackage.overseerMemberId !== user.id) {
      throw new Error("คุณไม่มีสิทธิ์ลบ Package ที่คุณไม่ได้ดูแล");
    }
  } else if (role !== "superadmin") {
    throw new Error("คุณไม่มีสิทธิ์ลบ Package");
  }

  // soft delete
  return prisma.package.update({
    where: { id: Number(packageId) },
    data: { isDeleted: true, deleteAt: new Date() },
  });
};

/* ============================================================================================
 * Detail
 * ============================================================================================ */

/*
 * คำอธิบาย : ดึงข้อมูลรายละเอียดแพ็กเกจตาม ID
 * Input: id - ID ของแพ็กเกจ
 * Output : ข้อมูลแพ็กเกจพร้อม relation ที่เกี่ยวข้อง
 */
export const getPackageDetailById = async (id: number) => {
  return prisma.package.findUnique({
    where: { id: Number(id) },
    include: {
      createPackage: { select: { id: true, fname: true, lname: true } },
      overseerPackage: { select: { id: true, fname: true, lname: true } },
      tagPackages: {
        include: { tag: { select: { id: true, name: true } } },
      },
      packageFile: { select: { id: true, filePath: true, type: true } },
      location: {
        select: {
          id: true,
          detail: true,
          houseNumber: true,
          villageNumber: true,
          alley: true,
          subDistrict: true,
          district: true,
          province: true,
          postalCode: true,
          latitude: true,
          longitude: true,
        },
      },
      homestayHistories: {
        include: {
          homestay: {
            select: {
              id: true,
              name: true,
              type: true,
              guestPerRoom: true,
              totalRoom: true,
              facility: true,
              homestayImage: { select: { id: true, image: true, type: true } },
              location: {
                select: {
                  detail: true,
                  subDistrict: true,
                  district: true,
                  province: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

// ===== Delegate Functions (ส่งต่อการทำงาน) =====

/*
 * คำอธิบาย : (Delegate) สร้างแพ็กเกจโดย SuperAdmin
 */
export const createPackageBySuperAdmin = (
  data: PackageDto,
  _unusedUserId: number
) => createPackage(data);
/*
 * คำอธิบาย : (Delegate) สร้างแพ็กเกจโดย Admin
 */
export const createPackageByAdmin = (data: PackageDto, _unusedUserId: number) =>
  createPackage(data);
/*
 * คำอธิบาย : (Delegate) สร้างแพ็กเกจโดย Member
 */
export const createPackageByMember = (
  data: PackageDto,
  _unusedUserId: number
) => createPackage(data);

/*
 * คำอธิบาย : (Delegate) แก้ไขแพ็กเกจโดย SuperAdmin
 */
export const editPackageBySuperAdmin = (
  id: number,
  data: any,
  _unusedUserId: number
) => editPackage(id, data);
/*
 * คำอธิบาย : (Delegate) แก้ไขแพ็กเกจโดย Admin
 */
export const editPackageByAdmin = (
  id: number,
  data: any,
  _unusedUserId: number
) => editPackage(id, data);
/*
 * คำอธิบาย : (Delegate) แก้ไขแพ็กเกจโดย Member
 */
export const editPackageByMember = (
  id: number,
  data: any,
  _unusedUserId: number
) => editPackage(id, data);

/*
 * คำอธิบาย : (Delegate) ลบแพ็กเกจโดย SuperAdmin
 */
export const deletePackageBySuperAdmin = (userId: number, packageId: number) =>
  deletePackage(userId, packageId);
/*
 * คำอธิบาย : (Delegate) ลบแพ็กเกจโดย Admin
 */
export const deletePackageByAdmin = (userId: number, packageId: number) =>
  deletePackage(userId, packageId);
/*
 * คำอธิบาย : (Delegate) ลบแพ็กเกจโดย Member
 */
export const deletePackageByMember = (userId: number, packageId: number) =>
  deletePackage(userId, packageId);

/*
 * คำอธิบาย : (Delegate) ดึงรายการแพ็กเกจสำหรับ SuperAdmin
 */
export const getPackagesBySuperAdmin = (userId: number, page = 1, limit = 10) =>
  getPackageByRole(userId, page, limit);
/*
 * คำอธิบาย : (Delegate) ดึงรายการแพ็กเกจสำหรับ Admin
 */
export const getPackagesByAdmin = (userId: number, page = 1, limit = 10) =>
  getPackageByRole(userId, page, limit);
/*
 * คำอธิบาย : (Delegate) ดึงรายการแพ็กเกจสำหรับ Member
 */
export const getPackagesByMember = (userId: number, page = 1, limit = 10) =>
  getPackageByRole(userId, page, limit);
/*
 * คำอธิบาย : (Delegate) ดึงรายการแพ็กเกจสำหรับ Tourist
 */
export const getPackagesByTourist = (userId: number, page = 1, limit = 10) =>
  getPackageByRole(userId, page, limit);

/*
 * คำอธิบาย : ดึงรายการแพ็กเกจใหม่ 40 อัน (Public API)
 * Input: -
 * Output : Array ของข้อมูลแพ็กเกจใหม่ 40 อัน (เรียงตาม id มากไปน้อย)
 */
export async function getNewestPackages() {
  const packages = await prisma.package.findMany({
    where: {
      isDeleted: false,
      statusPackage: PackagePublishStatus.PUBLISH,
      statusApprove: PackageApproveStatus.APPROVE,
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      capacity: true,
      startDate: true,
      dueDate: true,
      facility: true,
      community: {
        select: {
          id: true,
          name: true,
        },
      },
      location: {
        select: {
          id: true,
          province: true,
          district: true,
          subDistrict: true,
        },
      },
      packageFile: {
        where: {
          type: "COVER",
        },
        select: {
          filePath: true,
        },
        take: 1,
      },
      tagPackages: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: "desc",
    },
    take: 40,
  });

  return packages.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    price: pkg.price,
    capacity: pkg.capacity,
    startDate: pkg.startDate,
    dueDate: pkg.dueDate,
    facility: pkg.facility,
    community: pkg.community,
    location: pkg.location,
    coverImage: pkg.packageFile[0]?.filePath || null,
    tags: pkg.tagPackages.map((tp) => tp.tag),
  }));
}

/*
 * คำอธิบาย : ดึงรายการแพ็กเกจยอดนิยม 40 อัน (Public API)
 * Input: -
 * Output : Array ของข้อมูลแพ็กเกจยอดนิยม 40 อัน (เรียงตามจำนวนการจองที่สำเร็จ)
 */
export async function getPopularPackages() {
  // ดึงแพ็กเกจทั้งหมดที่เผยแพร่และอนุมัติแล้ว
  const packages = await prisma.package.findMany({
    where: {
      isDeleted: false,
      statusPackage: PackagePublishStatus.PUBLISH,
      statusApprove: PackageApproveStatus.APPROVE,
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      capacity: true,
      startDate: true,
      dueDate: true,
      facility: true,
      community: {
        select: {
          id: true,
          name: true,
        },
      },
      location: {
        select: {
          id: true,
          province: true,
          district: true,
          subDistrict: true,
        },
      },
      packageFile: {
        where: {
          type: "COVER",
        },
        select: {
          filePath: true,
        },
        take: 1,
      },
      tagPackages: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      bookingHistories: {
        where: {
          status: "BOOKED",
        },
        select: {
          id: true,
        },
      },
    },
  });

  // นับจำนวนการจองที่สำเร็จและเรียงลำดับ
  const packagesWithBookingCount = packages.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    price: pkg.price,
    capacity: pkg.capacity,
    startDate: pkg.startDate,
    dueDate: pkg.dueDate,
    facility: pkg.facility,
    community: pkg.community,
    location: pkg.location,
    coverImage: pkg.packageFile[0]?.filePath || null,
    tags: pkg.tagPackages.map((tp) => tp.tag),
    bookingCount: pkg.bookingHistories.length,
  }));

  // เรียงตามจำนวนการจอง (มากไปน้อย) แล้วเลือก 40 อันแรก
  const popularPackages = packagesWithBookingCount
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 40)
    .map(({ bookingCount, ...pkg }) => pkg); // ลบ bookingCount ออกจากผลลัพธ์

  return popularPackages;
}

type ListByPackageInput = {
  userId: number;
  packageId: number;
  query?: string;
  limit?: number;
};

/*
 * คำอธิบาย : ดึงรายการที่พัก (Homestays) ที่อยู่ในชุมชนเดียวกับแพ็กเกจที่ระบุ
 * Input: { userId, packageId, query, limit }
 * Output : Array ของข้อมูลที่พัก
 */
export async function listHomestaysByPackage({
  userId,
  packageId,
  query = "",
  limit = 8,
}: ListByPackageInput) {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user");
  if (!Number.isInteger(packageId) || packageId <= 0)
    throw new Error("Invalid packageId");

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!currentUser) throw new Error("User not found");

  const foundPackage = await prisma.package.findFirst({
    where: { id: packageId, isDeleted: false },
    select: { communityId: true },
  });
  if (!foundPackage) throw new Error("Package not found");
  if (!foundPackage.communityId) throw new Error("Package has no community");

  const nameFilter = query.trim()
    ? { name: { contains: query.trim() } }
    : undefined;

  const homestays = await prisma.homestay.findMany({
    where: {
      communityId: foundPackage.communityId,
      isDeleted: false,
      ...(nameFilter ? { OR: [nameFilter] } : {}),
    },
    select: {
      id: true,
      name: true,
      facility: true,
      homestayImage: { select: { image: true } },
    },
    orderBy: [{ name: "asc" }],
    take: Math.max(1, Math.min(50, Number(limit) || 8)),
  });

  return homestays;
}

/*
 * คำอธิบาย : อัปเดต Tags ที่ผูกกับแพ็กเกจ (แบบลบของเก่า-สร้างใหม่)
 * Input: packageId - ID ของแพ็กเกจ, tagIds - Array ของ ID แท็ก
 * Output : (void)
 */
export async function updatePackageTags(packageId: number, tagIds: number[]) {
  const packageIdNumber = Number(packageId);
  const validTagIds = (tagIds ?? [])
    .map((tagId) => Number(tagId))
    .filter((id) => Number.isFinite(id) && id > 0);

  // ลบความเชื่อมเดิมทั้งหมดของแพ็กเกจนี้ก่อน
  await prisma.tagsPackages.deleteMany({
    where: { packageId: packageIdNumber },
  });

  // สร้างความเชื่อมใหม่ (แทนที่ทั้งชุด)
  if (validTagIds.length > 0) {
    await prisma.tagsPackages.createMany({
      data: validTagIds.map((tagId) => ({ packageId: packageIdNumber, tagId })),
      skipDuplicates: true,
    });
  }
}

type ListHomestaysInput = { userId: number; query?: string; limit?: number };

/*
 * คำอธิบาย : ดึงรายการที่พัก (Homestays) ที่อยู่ในชุมชนเดียวกับผู้ใช้ (Admin/Member)
 * Input: { userId, query, limit }
 * Output : Array ของข้อมูลที่พัก
 */
// Services/package/package-service.ts

export async function listCommunityHomestays({
  userId,
  query = "",
  limit = 8,
}: ListHomestaysInput) {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user");

  // 1. ดึงข้อมูล User พร้อมเช็คว่าเป็น Admin ของชุมชนไหน
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: { select: { name: true } },
      communityMembers: { select: { communityId: true }, take: 1 },
      // [เพิ่ม] ดึงชุมชนที่ User นี้เป็น Admin
      communityAdmin: {
        select: { id: true },
        take: 1, // เอามาอันแรกก่อน (สมมติ 1 คนดูแล 1 ชุมชน)
      },
    },
  });

  if (!currentUser) throw new Error("User not found");

  // 2. หา Community ID ที่ถูกต้อง (รองรับทั้ง Member และ Admin)
  let targetCommunityId = currentUser.communityMembers[0]?.communityId;

  // ถ้าไม่มี communityId ติดตัว ให้ดูว่าเป็น Admin ของชุมชนไหนไหม
  if (!targetCommunityId && currentUser.communityAdmin.length > 0) {
    targetCommunityId = currentUser.communityAdmin[0]!.id;
  }

  // ถ้าหาไม่เจอทั้งคู่ -> Error
  if (!targetCommunityId) throw new Error("User has no community");

  const trimmedQuery = query.trim();
  const orFilter = trimmedQuery ? [{ name: { contains: trimmedQuery } }] : [];

  const homestays = await prisma.homestay.findMany({
    where: {
      communityId: targetCommunityId,
      isDeleted: false,
      ...(orFilter.length ? { OR: orFilter } : {}),
    },
    select: {
      id: true,
      name: true,
      facility: true,
      homestayImage: { select: { image: true } },
    },
    orderBy: [{ name: "asc" }],
    take: Math.max(1, Math.min(50, Number(limit) || 8)),
  });

  return homestays;
}

/*
 * คำอธิบาย : ดึงรายชื่อสมาชิก (Members) และผู้ดูแล (Admin) ของชุมชน
 * Input: communityId - ID ของชุมชน, query - คำค้นหา (optional), limit - จำนวน (optional)
 * Output : Array ของผู้ใช้ (Admin 1 คน + Members)
 */
export async function getCommunityMembersAndAdmin(
  communityId: number,
  query?: string,
  limit = 50
) {
  if (!Number.isInteger(communityId) || communityId <= 0) {
    throw new Error("ID must be Number");
  }

  const community = await prisma.community.findFirst({
    where: { id: communityId, isDeleted: false },
    select: { id: true, adminId: true },
  });
  if (!community) throw new Error("Community not found");

  const admin =
    community.adminId != null
      ? await prisma.user.findFirst({
        where: {
          id: community.adminId,
          isDeleted: false,
          role: { name: "admin" },
        },
        select: { id: true, fname: true, lname: true },
      })
      : null;

  const nameFilter =
    query && query.trim()
      ? {
        OR: [
          { fname: { contains: query.trim(), mode: "insensitive" } },
          { lname: { contains: query.trim(), mode: "insensitive" } },
        ],
      }
      : {};

  const members = await prisma.user.findMany({
    where: {
      isDeleted: false,
      role: { name: "member" },
      communityMembers: {
        some: {
          communityId: communityId,
        },
      },
      ...nameFilter,
    },
    select: { id: true, fname: true, lname: true },
    orderBy: [{ fname: "asc" }, { lname: "asc" }],
    take: Number.isFinite(limit) ? Number(limit) : 50,
  });

  return [...(admin ? [admin] : []), ...members];
}

type ListAllHomestaysInput = {
  query?: string;
  limit?: number;
};

/*
 * คำอธิบาย : [Super Admin] ดึง Homestays ทั้งหมดในระบบ
 * Input: { query, limit }
 * Output : Array ของข้อมูลที่พัก
 */
export async function listAllHomestaysSuperAdmin({
  query = "",
  limit = 8,
}: ListAllHomestaysInput) {
  const trimmedQuery = query.trim();
  const orFilter = trimmedQuery
    ? [{ name: { contains: trimmedQuery, mode: "insensitive" } }]
    : [];

  const homestays = await prisma.homestay.findMany({
    where: {
      isDeleted: false,
      ...(orFilter.length ? { OR: orFilter } : {}),
    },
    select: {
      id: true,
      name: true,
      facility: true,
      homestayImage: {
        select: { image: true },
        where: { type: "COVER" }, // เลือกเฉพาะ Cover
        take: 1,
      },
      community: {
        // แสดงว่าอยู่ชุมชนไหน
        select: { id: true, name: true },
      },
    },
    orderBy: [{ name: "asc" }],
    take: Math.max(1, Math.min(50, Number(limit) || 8)),
  });

  return homestays;
}

/*
 * ฟังก์ชัน : getAllFeedbacks
 * คำอธิบาย : (Admin) ดึง Feedback ทั้งหมดของแพ็กเกจในชุมชนของผู้ใช้
 * Input:
 *   - userId : number (รหัสผู้ใช้จาก token)
 * Output:
 *   - Object communityData (ข้อมูลชุมชน + แพ็กเกจ + feedback ทั้งหมด)
 */
export const getAllFeedbacks = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      communityMembers: { select: { communityId: true }, take: 1 },
      communityAdmin: { select: { id: true }, take: 1 },
    },
  });

  const communityId =
    user?.communityMembers[0]?.communityId ?? user?.communityAdmin[0]?.id;

  if (!communityId) {
    console.log("User not found or does not belong to a community.");
    return []; // หรือ return ค่าว่างตามที่คุณต้องการ
  }

  const communityData = await prisma.community.findUnique({
    where: {
      id: communityId,
    },
    include: {
      packages: {
        include: {
          bookingHistories: {
            include: {
              feedbacks: {
                include: {
                  feedbackImages: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!communityData) {
    console.log("Community data not found.");
    return [];
  }

  return communityData;
};
/*
 * คำอธิบาย : ดึงรายละเอียดประวัติแพ็กเกจตามหมายเลข ID (สำหรับแอดมิน)
 * Method : ใช้ Prisma query join ตารางที่เกี่ยวข้องทั้งหมด
 * Input  : packageId (หมายเลขแพ็กเกจ)
 * Output : Object รวมข้อมูลแพ็กเกจ, HomestayHistory, BookingHistory
 * การทำงาน :
 *   1. ตรวจสอบว่า packageId ถูกต้องและมีอยู่ในระบบ
 *   2. ใช้ Prisma findUnique() เพื่อดึงข้อมูลหลักจากตาราง packages
 *   3. include ตารางที่เกี่ยวข้อง เช่น HomestayHistory, BookingHistory, User, Community
 *   4. ส่ง Object ที่จัดรูปแบบแล้วกลับไปยัง Controller
 */
export async function getPackageHistoryDetailById(packageId: number) {
  const foundPackage = await prisma.package.findUnique({
    where: { id: packageId, isDeleted: false },
    include: {
      community: { select: { id: true, name: true } },
      createPackage: { select: { id: true, fname: true, lname: true } },
      overseerPackage: { select: { id: true, fname: true, lname: true } },
      location: true,
      packageFile: true,
      bookingHistories: {
        select: {
          id: true,
          bookingAt: true,
          totalParticipant: true,
          status: true,
          tourist: { select: { fname: true, lname: true } },
        },
      },
      homestayHistories: {
        include: {
          homestay: {
            select: {
              id: true,
              name: true,
              type: true,
              guestPerRoom: true,
              totalRoom: true,
              facility: true,
            },
          },
        },
      },
    },
  });

  if (!foundPackage) return null;
  return foundPackage;
}
/*
 * คำอธิบาย : ดึงรายการประวัติแพ็กเกจที่จบไปแล้วของ admin
 * Input: userId - ID ของผู้ใช้, page - เลขหน้า, limit - จำนวนต่อหน้า
 * Output : ข้อมูลแพ็กเกจพร้อม Pagination
 */
export const getHistoriesPackageByAdmin = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginationResponse<any>> => {
  // ตรวจสอบ user
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: { role: true, communityAdmin: true },
  });

  if (!user) throw new Error(`User ID ${userId} ไม่พบในระบบ`);
  if (user.role?.name !== "admin")
    throw new Error("อนุญาตเฉพาะผู้ดูแล (Admin) เท่านั้น");

  // ดึงรายการชุมชนที่ admin ดูแล
  const adminCommunityIds = user.communityAdmin.map((c: any) => c.id);
  if (adminCommunityIds.length === 0)
    throw new Error("คุณยังไม่ได้สังกัดชุมชนใดในฐานะผู้ดูแล");

  // เงื่อนไขแพ็กเกจที่จบแล้ว (วันที่สิ้นสุด < ปัจจุบัน)
  const now = new Date();

  const whereCondition = {
    isDeleted: false,
    communityId: { in: adminCommunityIds },
    dueDate: { lt: now },
  };

  // pagination
  const skip = (page - 1) * limit;
  const totalCount = await prisma.package.count({ where: whereCondition });

  const packages = await prisma.package.findMany({
    where: whereCondition,
    include: {
      community: { select: { id: true, name: true } },
      overseerPackage: {
        select: { id: true, fname: true, lname: true },
      },
    },
    orderBy: { dueDate: "desc" },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  // ส่งผลลัพธ์ในรูปแบบเดียวกับ getPackageByRole
  return {
    data: packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      community: pkg.community,
      overseerPackage: pkg.overseerPackage,
      statusPackage: pkg.statusPackage,
      dueDate: pkg.dueDate,
    })),
    pagination: { currentPage: page, totalPages, totalCount, limit },
  };
};

/*
 * ฟังก์ชัน : getPackageDetailByMember
 * คำอธิบาย : ดึงรายละเอียดแพ็กเกจสำหรับ Member โดยเช็คสิทธิ์
 * Input  : memberId (user.id ที่เป็น member), packageId
 * Output : รายละเอียดแพ็กเกจ (โครงเหมือน getPackageDetailById)
 */
export const getPackageDetailByMember = async (
  memberId: number,
  packageId: number
) => {
  return await prisma.package.findFirst({
    where: {
      id: packageId,
      isDeleted: false,
      OR: [
        // 1) เป็น Overseer ของแพ็กเกจนี้
        { overseerMemberId: memberId },

        // 2) เป็นสมาชิกของชุมชนนี้
        {
          community: {
            communityMembers: {
              some: {
                memberId,
                isDeleted: false,
              },
            },
          },
        },
      ],
    },
    select: {
      // ====== field ของ Package (ให้ตรงกับ JSON ที่ส่งมา) ======
      id: true,
      communityId: true,
      locationId: true,
      overseerMemberId: true,
      createById: true,
      name: true,
      description: true,
      capacity: true,
      price: true,
      warning: true,
      statusPackage: true,
      statusApprove: true,
      startDate: true,
      dueDate: true,
      bookingOpenDate: true,
      bookingCloseDate: true,
      facility: true,
      rejectReason: true,
      isDeleted: true,
      deleteAt: true,

      // ====== createPackage ======
      createPackage: {
        select: {
          id: true,
          fname: true,
          lname: true,
        },
      },

      // ====== overseerPackage ======
      overseerPackage: {
        select: {
          id: true,
          fname: true,
          lname: true,
          // ถ้าไม่อยากให้ activityRole โผล่ ก็ไม่ต้อง select
          // activityRole: true,
        },
      },

      // ====== tagPackages ======
      tagPackages: {
        select: {
          tagId: true,
          packageId: true,
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      // ====== packageFile ======
      packageFile: {
        select: {
          id: true,
          filePath: true,
          type: true,
        },
      },

      // ====== location ======
      location: {
        select: {
          id: true,
          detail: true,
          houseNumber: true,
          villageNumber: true,
          alley: true,
          subDistrict: true,
          district: true,
          province: true,
          postalCode: true,
          latitude: true,
          longitude: true,
        },
      },

      // ====== homestayHistories ======
      homestayHistories: {
        select: {
          id: true,
          packageId: true,
          homestayId: true,
          bookedRoom: true,
          checkInTime: true,
          checkOutTime: true,

          // ถ้าอยากใช้ detail homestay ไปทำ card
          homestay: {
            select: {
              id: true,
              name: true,
              type: true,
              guestPerRoom: true,
              totalRoom: true,
              facility: true,
              // location, image, tags เพิ่มได้ถ้าหน้า detail ใช้
              location: {
                select: {
                  id: true,
                  detail: true,
                  houseNumber: true,
                  villageNumber: true,
                  alley: true,
                  subDistrict: true,
                  district: true,
                  province: true,
                  postalCode: true,
                  latitude: true,
                  longitude: true,
                },
              },
              homestayImage: {
                select: {
                  id: true,
                  image: true,
                  type: true,
                },
              },
              tagHomestays: {
                select: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

/*
 * คำอธิบาย : ดึงรายการประวัติแพ็กเกจที่จบไปแล้วของ member
 * Input: userId - ID ของผู้ใช้, page - เลขหน้า, limit - จำนวนต่อหน้า
 * Output : ข้อมูลแพ็กเกจพร้อม Pagination
 */
export const getHistoriesPackageByMember = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginationResponse<any>> => {
  // ตรวจสอบ user
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: { role: true },
  });

  if (!user) throw new Error(`User ID ${userId} ไม่พบในระบบ`);
  if (user.role?.name !== "member")
    throw new Error("อนุญาตเฉพาะผู้ดูแล (Member) เท่านั้น");

  // เงื่อนไขแพ็กเกจที่จบแล้ว (วันที่สิ้นสุด < ปัจจุบัน)
  const now = new Date();

  const whereCondition = {
    isDeleted: false,
    overseerMemberId: user.id, // กรองเฉพาะที่ member คนนี้ดูแล
    dueDate: { lt: now },
  };

  // pagination
  const skip = (page - 1) * limit;
  const totalCount = await prisma.package.count({ where: whereCondition });

  const packages = await prisma.package.findMany({
    where: whereCondition,
    include: {
      community: { select: { id: true, name: true } },
      overseerPackage: {
        select: { id: true, fname: true, lname: true },
      },
    },
    orderBy: { dueDate: "desc" },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  // ส่งผลลัพธ์ในรูปแบบเดียวกับ getPackageByRole
  return {
    data: packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      community: pkg.community,
      overseerPackage: pkg.overseerPackage,
      statusPackage: pkg.statusPackage,
      dueDate: pkg.dueDate,
    })),
    pagination: { currentPage: page, totalPages, totalCount, limit },
  };
};
/*
 * คำอธิบาย : ดึงรายการแพ็กเกจสถานะ Draft ของผู้ใช้
 * Input: createById - ID ของผู้ใช้ที่สร้างแพ็กเกจ
 * Output : Array ของแพ็กเกจสถานะ Draft
 */
export async function getDraftPackages(createById: number) {
  const draftPackages = await prisma.package.findMany({
    where: {
      statusPackage: PackagePublishStatus.DRAFT,
      createById: createById,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      statusPackage: true,
      community: {
        select: {
          name: true,
        },
      },
      overseerPackage: {
        select: {
          fname: true,
          lname: true,
        },
      },
    },
  });


  return draftPackages.map(pkg => ({
    ...pkg,
    overseerPackage: pkg.overseerPackage
      ? {
        name: `${pkg.overseerPackage.fname} ${pkg.overseerPackage.lname}`,
      }
      : null,
  }));
}

/*
 * คำอธิบาย : ลบแพ็กเกจสถานะ Draft ของผู้ใช้ (Soft Delete)
 * Input: packageId - ID ของแพ็กเกจ, createById - ID ของผู้ใช้ที่สร้างแพ็กเกจ
 * Output : ข้อความยืนยันการลบแพ็กเกจ
 */
export async function DeleteDraftPackage(packageIdInput: unknown, createByIdInput: unknown) {
  // แปลงค่าที่เข้ามาเป็น number
  const packageId = Number(packageIdInput);
  const createById = Number(createByIdInput);

  if (isNaN(packageId) || isNaN(createById)) {
    throw new Error("packageId หรือ createById ไม่ถูกต้อง");
  }

  // หาแพ็กเกจด้วย findUnique (id เป็น unique key) แทน findFirst
  const draftPackage = await prisma.package.findUnique({
    where: { id: packageId },
    select: {
      id: true,
      statusPackage: true,
      isDeleted: true,
      createById: true,
    },
  });

  if (!draftPackage) {
    throw new Error("ไม่พบแพ็กเกจ");
  }

  if (draftPackage.createById !== createById) {
    throw new Error("ผู้ใช้ไม่มีสิทธิ์ลบแพ็กเกจนี้");
  }

  if (draftPackage.statusPackage !== PackagePublishStatus.DRAFT) {
    throw new Error("แพ็กเกจไม่ใช่สถานะ Draft");
  }

  if (draftPackage.isDeleted) {
    throw new Error("แพ็กเกจถูกลบไปแล้ว");
  }

  // Soft delete
  await prisma.package.update({
    where: { id: packageId },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });

  return { message: "ลบแพ็กเกจ Draft สำเร็จ (Soft Delete)" };
}
/*
 * คำอธิบาย : ลบแพ็กเกจสถานะ Draft ของผู้ใช้เป็นกลุ่ม (Soft Delete)
 * Input:   ids - Array ของ ID แพ็กเกจ
 * Output : ผลลัพธ์การลบแพ็กเกจ
 */
export const bulkDeletePackages = async (ids: number[]) => {
  if (!ids || ids.length === 0) {
    return {
      success: false,
      message: "packageId ไม่ถูกต้อง",
    };
  }

  const result = await prisma.package.updateMany({
    where: {
      id: { in: ids },
      isDeleted: false,
    },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    },
  });

  return {
    success: true,
    message: `${result.count} แพ็กเกจถูกลบเรียบร้อย`,
  };
};

/**
 * คำอธิบาย : ดึงรายละเอียดแพ็กเกจสำหรับนักท่องเที่ยว (Tourist)
 * Logic : 
 * 1. ต้องเป็นแพ็กเกจที่ PUBLISH และ APPROVE แล้วเท่านั้น
 * 2. ดึงข้อมูลที่พัก (Homestay) หากมีการผูกไว้ (สำหรับ UI ส่วน "รายละเอียดที่พัก")
 * 3. ดึงข้อมูล "แพ็กเกจที่คุณสนใจ" (Related Packages) โดยอิงจากชุมชนเดียวกัน
 */
export const getPackageDetailByTourist = async (packageId: number) => {
  const packageDetail = await prisma.package.findFirst({
    where: {
      id: Number(packageId),
      isDeleted: false,
      statusPackage: PackagePublishStatus.PUBLISH,
      statusApprove: PackageApproveStatus.APPROVE,
    },
    include: {
      packageFile: {
        select: { id: true, filePath: true, type: true },
      },
      location: {
        select: {
          id: true,
          detail: true,
          subDistrict: true,
          district: true,
          province: true,
          postalCode: true,
          latitude: true,
          longitude: true,
        },
      },
      community: {
        select: {
          id: true,
          name: true,
          phone: true,
        }
      },
      homestayHistories: {
        select: {
          id: true,
          checkInTime: true,
          checkOutTime: true,
          bookedRoom: true,
          homestay: {
            select: {
              id: true,
              name: true,
              type: true,
              guestPerRoom: true,
              totalRoom: true,
              facility: true,
              homestayImage: {
                select: { id: true, image: true, type: true }
              },
              location: {
                select: {
                  subDistrict: true,
                  province: true,
                }
              }
            },
          },
        },
      },
      tagPackages: {
        select: {
          tagId: true,
          tag: { select: { id: true, name: true } }
        }
      }
    },
  });

  if (!packageDetail) {
    return null;
  }

  const currentTagIds = packageDetail.tagPackages.map(tp => tp.tagId);

  const relatedPackages = await prisma.package.findMany({
    where: {
      id: { not: packageDetail.id },
      isDeleted: false,
      statusPackage: PackagePublishStatus.PUBLISH,
      statusApprove: PackageApproveStatus.APPROVE,
      tagPackages: {
        some: {
          tagId: { in: currentTagIds }
        }
      }
    },
    select: {
      id: true,
      name: true,
      price: true,
      capacity: true,
      packageFile: {
        where: { type: "COVER" },
        select: { filePath: true },
        take: 1,
      },
      location: {
        select: {
          subDistrict: true,
          province: true,
        }
      },
      tagPackages: {
        select: {
          tag: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      id: 'desc'
    },
    // take: 8,
  });

  return {
    ...packageDetail,
    relatedPackages: relatedPackages.map(packageFind => ({
      id: packageFind.id,
      name: packageFind.name,
      price: packageFind.price,
      capacity: packageFind.capacity,
      location: packageFind.location,
      coverImage: packageFind.packageFile[0]?.filePath || null,
      tags: packageFind.tagPackages.map(tp => tp.tag.name)
    }))
  };
};