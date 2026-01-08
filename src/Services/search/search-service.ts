/*
 * คำอธิบาย : Service สำหรับการค้นหาแพ็กเกจและชุมชน
 * รองรับการค้นหาแพ็กเกจตาม tag (หลาย tag) และการค้นหาทั้งแพ็กเกจและชุมชนตาม keyword
 * สามารถใช้ search และ tag ร่วมกันได้
 */
import {
  ImageType,
  PackageApproveStatus,
  PackagePublishStatus,
} from "@prisma/client";
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
  page: number = 1,
  limit: number = 10,
  sort: "latest" | "price-low" | "price-high" | "popular" | undefined = "latest"
) {
  // ตรวจสอบว่ามี search หรือ tags อย่างน้อยหนึ่งอย่าง
  if ((!search || search.trim() === "") && (!tags || tags.length === 0)) {
    throw new Error("กรุณาระบุ search หรือ tag อย่างน้อยหนึ่งอย่าง");
  }

  const searchTerm = search?.trim();
  const tagNames =
    tags?.filter((tag) => tag && tag.trim() !== "").map((tag) => tag.trim()) ||
    [];

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

  // กำหนด orderBy ตาม sort parameter
  let orderBy: any;
  // let needBookingCount = false; // ไม่จำเป็นต้องใช้ flag แล้ว เพราะเราจะดึงมาคำนวณทุกกรณี

  switch (sort) {
    case "price-low":
      orderBy = { price: "asc" };
      break;
    case "price-high":
      orderBy = { price: "desc" };
      break;
    case "popular":
      // สำหรับ popular จะ sort ใน managed memory หลังจากนับ bookingCount
      orderBy = { id: "desc" };
      break;
    case "latest":
    default:
      orderBy = { id: "desc" };
      break;
  }

  // ดึงข้อมูลแพ็กเกจทั้งหมดตามเงื่อนไข (ยังไม่ pagination) เพื่อนำมา filter ต่อ
  const candidates = await prisma.package.findMany({
    where: packageWhereConditions,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      capacity: true,
      startDate: true,
      dueDate: true,
      bookingCloseDate: true, // เพิ่มเพื่อเช็ควันปิดรับจอง
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
      bookingHistories: {
        where: {
          // นับเฉพาะสถานะที่ถือว่าจองที่นั่งแล้ว
          status: {
            in: ["PENDING", "BOOKED", "REFUND_PENDING", "REFUND_REJECTED"],
          },
        },
        select: {
          totalParticipant: true,
        },
      },
    },
    orderBy,
  });

  const now = new Date();

  // Filter ใน Memory: ตัดแพ็กเกจที่ปิดจองแล้ว หรือ เต็มแล้ว
  let filteredPackages = candidates.filter((pkg) => {
    // 1. ตรวจสอบวันปิดจอง
    if (pkg.bookingCloseDate && pkg.bookingCloseDate < now) {
      return false; // ปิดจองแล้ว
    }
    // ถ้าไม่มี bookingCloseDate อาจจะ check dueDate หรือปล่อยผ่าน (ในที่นี้เช็ค dueDate เป็น fallback)
    if (!pkg.bookingCloseDate && pkg.dueDate && pkg.dueDate < now) {
      return false; // เลยกำหนด package ไปแล้ว
    }

    // 2. ตรวจสอบความจุ
    if (pkg.capacity !== null) {
      const currentParticipants = pkg.bookingHistories.reduce(
        (sum, history) => sum + history.totalParticipant,
        0
      );
      if (currentParticipants >= pkg.capacity) {
        return false; // เต็มแล้ว
      }
    }

    return true; // ผ่านเงื่อนไข
  });

  // ถ้า sort = popular ให้เรียงลำดับใหม่ตามจำนวนผู้เข้าร่วม (booking count/participants)
  if (sort === "popular") {
    filteredPackages = filteredPackages.sort((a, b) => {
      const countA = a.bookingHistories.reduce(
        (sum, h) => sum + h.totalParticipant,
        0
      );
      const countB = b.bookingHistories.reduce(
        (sum, h) => sum + h.totalParticipant,
        0
      );
      return countB - countA;
    });
  }

  // Pagination Logic
  const totalCount = filteredPackages.length;
  const totalPages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;

  const paginatedPackages = filteredPackages.slice(skip, skip + limit);

  // ดึง community IDs จากแพ็กเกจทั้งหมดที่ "ผ่านการกรองแล้ว" (หรือจะเอา candidates ทั้งหมด? ปกติน่าจะเอา result set)
  // แต่เดิม search logic จะดึง communities ที่ match search term ด้วย
  const packageCommunityIds = [
    ...new Set(candidates.map((pkg) => pkg.communityId)), // ใช้ candidates หรือ filtered? ควรใช้ filtered เพื่อความสัมพันธ์
  ];
  // แก้ไข: ใช้ filteredPackages เพื่อให้ community ที่แสดงสัมพันธ์กับ package ที่เจอ
  const filteredPackageCommunityIds = [
    ...new Set(filteredPackages.map((pkg) => pkg.communityId)),
  ];

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
  // ตรงนี้เดิมใช้ ID จากแพ็กเกจที่ search เจอ ถ้าเรากรอง pkg ออก ก็ไม่ควรเอามาคิดหรือเปล่า?
  // User Prompt ไม่ได้ระบุละเอียด แต่ Logic "Package ... ต้องไม่เต็ม" น่าจะหมายถึง "การแสดงผล Package"
  // ส่วนชุมชน ถ้าค้นหาเจอชุมชนโดยตรง ก็ควรขึ้น
  if (filteredPackageCommunityIds.length > 0) {
    communityOrConditions.push({
      id: {
        in: filteredPackageCommunityIds,
      },
    });
  }

  let communities: any[] = [];
  if (communityOrConditions.length > 0) {
    communities = await prisma.community.findMany({
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
  }

  return {
    packages: {
      data: paginatedPackages.map((pkg) => ({
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
