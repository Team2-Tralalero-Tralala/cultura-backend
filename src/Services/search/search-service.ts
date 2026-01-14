/*
 * คำอธิบาย : Service สำหรับการค้นหาแพ็กเกจและชุมชน
 * รองรับการค้นหาแพ็กเกจตาม tag (หลาย tag) และการค้นหาทั้งแพ็กเกจและชุมชนตาม keyword
 * สามารถใช้ search และ tag ร่วมกันได้
 */
import { ImageType, PackageApproveStatus, PackagePublishStatus } from "@prisma/client";
import prisma from "../database-service.js";

/*
 * ฟังก์ชัน : searchPackagesAndCommunities
 * คำอธิบาย : ค้นหาแพ็กเกจและชุมชนตาม keyword และ/หรือ tag(s) พร้อมการกรองราคาและการเรียงลำดับ
 * Input : 
 *   - search (string | undefined) - คำค้นหา (optional)
 *   - tags (string[] | undefined) - array ของ tag names (optional)
 *   - priceMin (number | undefined) - ราคาขั้นต่ำ (optional)
 *   - priceMax (number | undefined) - ราคาสูงสุด (optional)
 *   - page (number) - หมายเลขหน้า
 *   - limit (number) - จำนวนรายการต่อหน้า
 *   - sort (string | undefined) - การเรียงลำดับ (optional, ค่าที่อนุญาต: latest, price-low, price-high, popular)
 * Output : Object ประกอบด้วย packages (พร้อม pagination) และ communities
 * 
 * รองรับ:
 *   - ค้นหาตาม keyword เท่านั้น: searchPackagesAndCommunities("keyword", undefined, undefined, undefined, 1, 10, "latest")
 *   - ค้นหาตาม tag(s) เท่านั้น: searchPackagesAndCommunities(undefined, ["tag1", "tag2"], undefined, undefined, 1, 10, "price-low")
 *   - ค้นหาตาม keyword และ tag(s) ร่วมกัน: searchPackagesAndCommunities("keyword", ["tag1"], undefined, undefined, 1, 10, "price-high")
 *   - กรองตามราคา: searchPackagesAndCommunities("keyword", undefined, 1000, 5000, 1, 10, "popular")
 */
export async function searchPackagesAndCommunities(
  search: string | undefined,
  tags: string[] | undefined,
  priceMin: number | undefined,
  priceMax: number | undefined,
  startDateStr: string | undefined,
  endDateStr: string | undefined,
  page: number = 1,
  limit: number = 10,
  sort: "latest" | "price-low" | "price-high" | "popular" | undefined = "latest"
) {
  // ตรวจสอบว่ามี search หรือ tags อย่างน้อยหนึ่งอย่าง
  if ((!search || search.trim() === "") && (!tags || tags.length === 0)) {
    throw new Error("กรุณาระบุ search หรือ tag อย่างน้อยหนึ่งอย่าง");
  }

  const searchTerm = search?.trim();
  const tagNames = tags?.filter((tag) => tag && tag.trim() !== "").map((tag) => tag.trim()) || [];

  /*
   * ฟังก์ชัน: parseSearchDateParam
   * คำอธิบาย: รองรับทั้ง "YYYY-MM-DD" และ ISO date-time
   * - หากเป็น "YYYY-MM-DD": แปลงเป็น local start-of-day / end-of-day เพื่อให้ค้นหาถูกต้องตามวัน
   */
  const parseSearchDateParam = (value: string, boundary: "start" | "end"): Date | null => {
    const trimmed = value.trim();
    const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) {
      const year = Number(ymd[1]);
      const monthIndex = Number(ymd[2]) - 1;
      const day = Number(ymd[3]);
      if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) return null;
      if (boundary === "start") return new Date(year, monthIndex, day, 0, 0, 0, 0);
      return new Date(year, monthIndex, day, 23, 59, 59, 999);
    }

    const dt = new Date(trimmed);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  const startDateFilter = startDateStr ? parseSearchDateParam(startDateStr, "start") : null;
  const endDateFilter = endDateStr ? parseSearchDateParam(endDateStr, "end") : null;
  const now = new Date();

  // ค้นหา tag records ถ้ามี tags (ใช้ exact match)
  let tagIds: number[] = [];
  if (tagNames.length > 0) {
    const tagRecords = await prisma.tag.findMany({
      where: {
        name: {
          in: tagNames,
        },
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
      },
    });
    tagIds = tagRecords.map((tag) => tag.id);

    // ถ้าไม่พบ tag ใดเลย และมี tags ระบุมา ให้ return empty
    if (tagIds.length === 0) {
      return {
        packages: {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalCount: 0,
            limit,
          },
        },
        communities: [],
      };
    }
  }

  // สร้างเงื่อนไข where สำหรับแพ็กเกจ
  const packageWhereConditions: any = {
    isDeleted: false,
    statusPackage: PackagePublishStatus.PUBLISH,
    statusApprove: PackageApproveStatus.APPROVE,
  };

  // สร้าง array สำหรับ AND conditions
  const andConditions: any[] = [];

  // กรองแพ็กเกจที่ "เวลาเริ่มกิจกรรมผ่านไปแล้ว" ออกเสมอ (ห้ามค้นหาเจอ/จองได้)
  andConditions.push({
    startDate: {
      gt: now,
    },
  });

  // กรองแพ็กเกจที่ "กำลังเปิดจองอยู่" เท่านั้น
  // เงื่อนไข: bookingOpenDate <= now <= bookingCloseDate (หากเป็น null จะไม่ผ่านเงื่อนไขโดยอัตโนมัติ)
  andConditions.push({
    bookingOpenDate: {
      lte: now,
    },
  });
  andConditions.push({
    bookingCloseDate: {
      gte: now,
    },
  });

  // เพิ่มเงื่อนไข search ถ้ามี
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { community: { name: { contains: searchTerm } } },
      ],
    });
  }

  // เพิ่มเงื่อนไข tags ถ้ามี
  if (tagIds.length > 0) {
    andConditions.push({
      tagPackages: {
        some: {
          tagId: {
            in: tagIds,
          },
        },
      },
    });
  }

  // เพิ่มเงื่อนไขราคา ถ้ามี
  if (priceMin !== undefined || priceMax !== undefined) {
    const priceCondition: any = {};
    if (priceMin !== undefined) {
      priceCondition.gte = priceMin;
    }
    if (priceMax !== undefined) {
      priceCondition.lte = priceMax;
    }
    andConditions.push({
      price: priceCondition,
    });
  }

  // เพิ่มเงื่อนไขช่วงวันที่ (กรองจาก startDate ของแพ็กเกจ)
  if (startDateFilter) {
    andConditions.push({
      startDate: {
        gte: startDateFilter,
      },
    });
  }

  if (endDateFilter) {
    andConditions.push({
      startDate: {
        lte: endDateFilter,
      },
    });
  }

  // ถ้ามีเงื่อนไขใดๆ ให้เพิ่ม AND
  if (andConditions.length > 0) {
    if (andConditions.length === 1) {
      // มีเงื่อนไขเดียว ให้ merge เข้าไปใน whereConditions โดยตรง
      Object.assign(packageWhereConditions, andConditions[0]);
    } else {
      // มีหลายเงื่อนไข ใช้ AND
      packageWhereConditions.AND = andConditions;
    }
  }

  // นับจำนวนแพ็กเกจทั้งหมด
  const totalCount = await prisma.package.count({
    where: packageWhereConditions,
  });

  // คำนวณ skip และ totalPages
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);

  // กำหนด orderBy ตาม sort parameter
  let orderBy: any;
  let needBookingCount = false;

  switch (sort) {
    case "price-low":
      orderBy = { price: "asc" };
      break;
    case "price-high":
      orderBy = { price: "desc" };
      break;
    case "popular":
      // สำหรับ popular ต้องนับจำนวนการจอง ต้องใช้วิธีพิเศษ
      needBookingCount = true;
      orderBy = { id: "desc" }; // ใช้เป็น default ก่อน แล้วจะ sort ใหม่
      break;
    case "latest":
    default:
      orderBy = { id: "desc" };
      break;
  }

  // ค้นหาแพ็กเกจ (พร้อม pagination)
  // สำหรับ popular ต้อง include bookingHistories เพื่อนับจำนวนการจอง
  const baseSelect = {
    id: true,
    name: true,
    description: true,
    price: true,
    capacity: true,
    startDate: true,
    dueDate: true,
    facility: true,
    communityId: true,
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
        type: ImageType.COVER,
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
  };

  let foundPackages: any[];
  if (needBookingCount) {
    // สำหรับ popular ต้องดึงทั้งหมดก่อนเพื่อ sort ตามจำนวนการจอง
    foundPackages = await prisma.package.findMany({
      where: packageWhereConditions,
      select: {
        ...baseSelect,
        bookingHistories: {
          where: {
            status: "BOOKED",
          },
          select: {
            id: true,
          },
        },
      },
      orderBy,
    });
  } else {
    // สำหรับ sort อื่นๆ ใช้ pagination ตามปกติ
    foundPackages = await prisma.package.findMany({
      where: packageWhereConditions,
      select: baseSelect,
      orderBy,
      skip,
      take: limit,
    });
  }

  // ถ้าเป็น popular ให้ sort ตามจำนวนการจอง
  let sortedPackages: any[];
  if (needBookingCount) {
    sortedPackages = foundPackages
      .map((pkg: any) => ({
        ...pkg,
        bookingCount: pkg.bookingHistories?.length || 0,
      }))
      .sort((a: any, b: any) => b.bookingCount - a.bookingCount)
      .slice(skip, skip + limit)
      .map(({ bookingCount, bookingHistories, ...pkg }: any) => pkg);
  } else {
    sortedPackages = foundPackages;
  }

  // ดึง community IDs จากแพ็กเกจทั้งหมดที่พบ (ไม่ใช่แค่หน้าที่เลือก)
  const allPackagesForCommunities = await prisma.package.findMany({
    where: packageWhereConditions,
    select: {
      communityId: true,
    },
  });
  const packageCommunityIds = [...new Set(allPackagesForCommunities.map((pkg) => pkg.communityId))];

  // สร้างเงื่อนไข OR สำหรับชุมชน
  const communityOrConditions: any[] = [];

  // เพิ่มเงื่อนไข search สำหรับชุมชน
  if (searchTerm) {
    communityOrConditions.push(
      { name: { contains: searchTerm } },
      { description: { contains: searchTerm } },
      { type: { contains: searchTerm } },
      { mainActivityName: { contains: searchTerm } },
      {
        mainActivityDescription: {
          contains: searchTerm,
        },
      }
    );
  }

  // เพิ่มเงื่อนไขสำหรับ communities ที่มี packages ที่ตรงกับ search term หรือ tags
  if (packageCommunityIds.length > 0) {
    communityOrConditions.push({
      id: {
        in: packageCommunityIds,
      },
    });
  }

  // ถ้าไม่มีเงื่อนไขใดเลย ให้ return empty communities
  if (communityOrConditions.length === 0) {
    return {
      packages: {
        data: sortedPackages.map((pkg) => ({
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
          tags: pkg.tagPackages.map((tagPackage: any) => tagPackage.tag),
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
        },
      },
      communities: [],
    };
  }

  // ค้นหาชุมชน
  const communities = await prisma.community.findMany({
    where: {
      isDeleted: false,
      status: "OPEN",
      OR: communityOrConditions,
    },
    select: {
      id: true,
      name: true,
      alias: true,
      type: true,
      description: true,
      mainActivityName: true,
      mainActivityDescription: true,
      rating: true,
      location: {
        select: {
          id: true,
          province: true,
          district: true,
          subDistrict: true,
        },
      },
      communityImage: {
        where: {
          type: "COVER",
        },
        select: {
          image: true,
        },
        take: 1,
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return {
    packages: {
      data: sortedPackages.map((pkg) => ({
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
          tags: pkg.tagPackages.map((tagPackage: any) => tagPackage.tag),
        })),
        pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    },
    communities: communities.map((community) => ({
      id: community.id,
      name: community.name,
      alias: community.alias,
      type: community.type,
      description: community.description,
      mainActivityName: community.mainActivityName,
      mainActivityDescription: community.mainActivityDescription,
      rating: community.rating,
      location: community.location,
      coverImage: community.communityImage[0]?.image || null,
    })),
  };
}
