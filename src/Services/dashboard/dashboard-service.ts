import prisma from "../database-service.js";

/*
 * คำอธิบาย : แผนที่จังหวัดตามภาคของประเทศไทย
 */
const REGION_TO_PROVINCES: { [key: string]: string[] } = {
  // English values from frontend
  north: [
    "เชียงใหม่",
    "เชียงราย",
    "น่าน",
    "พะเยา",
    "แพร่",
    "แม่ฮ่องสอน",
    "ลำปาง",
    "ลำพูน",
    "อุตรดิตถ์",
  ],
  central: [
    "กรุงเทพมหานคร",
    "กาญจนบุรี",
    "ตาก",
    "นครปฐม",
    "นครสวรรค์",
    "นนทบุรี",
    "ปทุมธานี",
    "พระนครศรีอยุธยา",
    "พิจิตร",
    "พิษณุโลก",
    "เพชรบูรณ์",
    "ลพบุรี",
    "สมุทรปราการ",
    "สมุทรสงคราม",
    "สมุทรสาคร",
    "สระบุรี",
    "สิงห์บุรี",
    "สุโขทัย",
    "สุพรรณบุรี",
    "อ่างทอง",
    "อุทัยธานี",
  ],
  northeast: [
    "กาฬสินธุ์",
    "ขอนแก่น",
    "ชัยภูมิ",
    "นครพนม",
    "นครราชสีมา",
    "บึงกาฬ",
    "บุรีรัมย์",
    "มหาสารคาม",
    "มุกดาหาร",
    "ยโสธร",
    "ร้อยเอ็ด",
    "เลย",
    "ศรีสะเกษ",
    "สกลนคร",
    "สุรินทร์",
    "หนองคาย",
    "หนองบัวลำภู",
    "อำนาจเจริญ",
    "อุดรธานี",
    "อุบลราชธานี",
  ],
  south: [
    "กระบี่",
    "ชุมพร",
    "ตรัง",
    "นครศรีธรรมราช",
    "นราธิวาส",
    "ปัตตานี",
    "พังงา",
    "พัทลุง",
    "ภูเก็ต",
    "ยะลา",
    "ระนอง",
    "สงขลา",
    "สตูล",
    "สุราษฎร์ธานี",
  ],
  // Thai values (for backward compatibility)
  เหนือ: [
    "เชียงใหม่",
    "เชียงราย",
    "น่าน",
    "พะเยา",
    "แพร่",
    "แม่ฮ่องสอน",
    "ลำปาง",
    "ลำพูน",
    "อุตรดิตถ์",
  ],
  ตะวันออก: [
    "จันทบุรี",
    "ฉะเชิงเทรา",
    "ชลบุรี",
    "ตราด",
    "ปราจีนบุรี",
    "ระยอง",
    "สระแก้ว",
  ],
  กลาง: [
    "กรุงเทพมหานคร",
    "กาญจนบุรี",
    "ตาก",
    "นครปฐม",
    "นครสวรรค์",
    "นนทบุรี",
    "ปทุมธานี",
    "พระนครศรีอยุธยา",
    "พิจิตร",
    "พิษณุโลก",
    "เพชรบูรณ์",
    "ลพบุรี",
    "สมุทรปราการ",
    "สมุทรสงคราม",
    "สมุทรสาคร",
    "สระบุรี",
    "สิงห์บุรี",
    "สุโขทัย",
    "สุพรรณบุรี",
    "อ่างทอง",
    "อุทัยธานี",
  ],
  ตะวันตก: ["กาญจนบุรี", "ตาก", "ประจวบคีรีขันธ์", "เพชรบุรี", "ราชบุรี"],
  ใต้: [
    "กระบี่",
    "ชุมพร",
    "ตรัง",
    "นครศรีธรรมราช",
    "นราธิวาส",
    "ปัตตานี",
    "พังงา",
    "พัทลุง",
    "ภูเก็ต",
    "ยะลา",
    "ระนอง",
    "สงขลา",
    "สตูล",
    "สุราษฎร์ธานี",
  ],
  อีสาน: [
    "กาฬสินธุ์",
    "ขอนแก่น",
    "ชัยภูมิ",
    "นครพนม",
    "นครราชสีมา",
    "บึงกาฬ",
    "บุรีรัมย์",
    "มหาสารคาม",
    "มุกดาหาร",
    "ยโสธร",
    "ร้อยเอ็ด",
    "เลย",
    "ศรีสะเกษ",
    "สกลนคร",
    "สุรินทร์",
    "หนองคาย",
    "หนองบัวลำภู",
    "อำนาจเจริญ",
    "อุดรธานี",
    "อุบลราชธานี",
  ],
  ภาคเหนือ: [
    "เชียงใหม่",
    "เชียงราย",
    "น่าน",
    "พะเยา",
    "แพร่",
    "แม่ฮ่องสอน",
    "ลำปาง",
    "ลำพูน",
    "อุตรดิตถ์",
  ],
  ภาคตะวันออก: [
    "จันทบุรี",
    "ฉะเชิงเทรา",
    "ชลบุรี",
    "ตราด",
    "ปราจีนบุรี",
    "ระยอง",
    "สระแก้ว",
  ],
  ภาคกลาง: [
    "กรุงเทพมหานคร",
    "กาญจนบุรี",
    "ตาก",
    "นครปฐม",
    "นครสวรรค์",
    "นนทบุรี",
    "ปทุมธานี",
    "พระนครศรีอยุธยา",
    "พิจิตร",
    "พิษณุโลก",
    "เพชรบูรณ์",
    "ลพบุรี",
    "สมุทรปราการ",
    "สมุทรสงคราม",
    "สมุทรสาคร",
    "สระบุรี",
    "สิงห์บุรี",
    "สุโขทัย",
    "สุพรรณบุรี",
    "อ่างทอง",
    "อุทัยธานี",
  ],
  ภาคตะวันตก: ["กาญจนบุรี", "ตาก", "ประจวบคีรีขันธ์", "เพชรบุรี", "ราชบุรี"],
  ภาคใต้: [
    "กระบี่",
    "ชุมพร",
    "ตรัง",
    "นครศรีธรรมราช",
    "นราธิวาส",
    "ปัตตานี",
    "พังงา",
    "พัทลุง",
    "ภูเก็ต",
    "ยะลา",
    "ระนอง",
    "สงขลา",
    "สตูล",
    "สุราษฎร์ธานี",
  ],
  ภาคอีสาน: [
    "กาฬสินธุ์",
    "ขอนแก่น",
    "ชัยภูมิ",
    "นครพนม",
    "นครราชสีมา",
    "บึงกาฬ",
    "บุรีรัมย์",
    "มหาสารคาม",
    "มุกดาหาร",
    "ยโสธร",
    "ร้อยเอ็ด",
    "เลย",
    "ศรีสะเกษ",
    "สกลนคร",
    "สุรินทร์",
    "หนองคาย",
    "หนองบัวลำภู",
    "อำนาจเจริญ",
    "อุดรธานี",
    "อุบลราชธานี",
  ],
};

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายชื่อจังหวัดตามภาค
 * Input : region (ชื่อภาค)
 * Output : array ของชื่อจังหวัดในภาคนั้น
 */
function getProvincesByRegion(region: string): string[] {
  return REGION_TO_PROVINCES[region] || [];
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้าง array ของ date keys ทั้งหมดในช่วงเวลาที่กำหนด
 * Input : startDate, endDate, groupBy
 * Output : array ของ date keys ตาม groupBy ที่กำหนด
 */
function generateDateRange(
  startDate: Date,
  endDate: Date,
  groupBy: "hour" | "day" | "week" | "month" | "year"
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    let dateKey: string;

    switch (groupBy) {
      case "hour":
        dateKey = `${current.getFullYear()}-${String(
          current.getMonth() + 1
        ).padStart(2, "0")}-${String(current.getDate()).padStart(
          2,
          "0"
        )} ${String(current.getHours()).padStart(2, "0")}:00`;
        current.setHours(current.getHours() + 1);
        break;
      case "day":
        dateKey = `${current.getFullYear()}-${String(
          current.getMonth() + 1
        ).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        current.setDate(current.getDate() + 1);
        break;
      case "week":
        const weekStart = new Date(current);
        weekStart.setDate(current.getDate() - current.getDay());
        dateKey = `${weekStart.getFullYear()}-${String(
          weekStart.getMonth() + 1
        ).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
        current.setDate(current.getDate() + 7);
        break;
      case "month":
        dateKey = `${current.getFullYear()}-${String(
          current.getMonth() + 1
        ).padStart(2, "0")}`;
        current.setMonth(current.getMonth() + 1);
        break;
      case "year":
        dateKey = `${current.getFullYear()}`;
        current.setFullYear(current.getFullYear() + 1);
        break;
      default:
        dateKey = `${current.getFullYear()}-${String(
          current.getMonth() + 1
        ).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        current.setDate(current.getDate() + 1);
    }

    dates.push(dateKey);

    // safety check to prevent infinite loops
    if (dates.length > 10000) {
      throw new Error("Date range too large");
    }
  }

  return dates;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูล Dashboard ของ Super Admin
 * Input : dateStart, dateEnd, page, limit, groupBy, filter
 * Output : ข้อมูล Dashboard พร้อม stats และ graph data
 */
export async function getSuperAdminDashboardData(
  dateStart: string,
  dateEnd: string,
  page: number = 1,
  limit: number = 10,
  groupBy: "hour" | "day" | "week" | "month" | "year" = "day",
  filter: {
    province?: string;
    region?: string;
    search?: string;
  } = {}
) {
  const skip = (page - 1) * limit;

  // validate dateStart and dateEnd
  if (!dateStart.trim() || !dateEnd.trim()) {
    throw new Error("dateStart and dateEnd are required");
  }

  // validate dateStart and dateEnd format
  if (
    !dateStart.match(/^\d{4}-\d{2}-\d{2}$/) ||
    !dateEnd.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    throw new Error("dateStart and dateEnd must be in format yyyy-mm-dd");
  }

  const startDate = new Date(dateStart);
  const endDate = new Date(dateEnd);
  endDate.setHours(23, 59, 59, 999);

  // count of all packages
  const totalPackages = await prisma.package.count({
    where: { isDeleted: false },
  });

  // count of all communities
  const totalCommunities = await prisma.community.count({
    where: { isDeleted: false },
  });

  // count of success booking (status = BOOKED)
  const successBookingCount = await prisma.bookingHistory.count({
    where: {
      status: "BOOKED",
      bookingAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // count of cancelled booking (status = REFUNDED or REFUND_REJECTED)
  const cancelledBookingCount = await prisma.bookingHistory.count({
    where: {
      status: {
        in: ["REFUNDED", "REFUND_REJECTED"],
      },
      bookingAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // count of bookingHistory in time (group by date) for graph
  const bookingHistories = await prisma.bookingHistory.findMany({
    where: {
      bookingAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      bookingAt: true,
    },
    orderBy: {
      bookingAt: "asc",
    },
  });

  // generate all date keys in the range
  const allDateKeys = generateDateRange(startDate, endDate, groupBy);

  // group bookings by date
  const bookingsByDate: { [key: string]: number } = {};

  // initialize all dates with 0
  allDateKeys.forEach((dateKey) => {
    bookingsByDate[dateKey] = 0;
  });

  // count bookings for each date
  bookingHistories.forEach((booking) => {
    let dateKey: string;
    const bookingDate = new Date(booking.bookingAt);

    switch (groupBy) {
      case "hour":
        dateKey = `${bookingDate.getFullYear()}-${String(
          bookingDate.getMonth() + 1
        ).padStart(2, "0")}-${String(bookingDate.getDate()).padStart(
          2,
          "0"
        )} ${String(bookingDate.getHours()).padStart(2, "0")}:00`;
        break;
      case "day":
        dateKey = `${bookingDate.getFullYear()}-${String(
          bookingDate.getMonth() + 1
        ).padStart(2, "0")}-${String(bookingDate.getDate()).padStart(2, "0")}`;
        break;
      case "week":
        const weekStart = new Date(bookingDate);
        weekStart.setDate(bookingDate.getDate() - bookingDate.getDay());
        dateKey = `${weekStart.getFullYear()}-${String(
          weekStart.getMonth() + 1
        ).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
        break;
      case "month":
        dateKey = `${bookingDate.getFullYear()}-${String(
          bookingDate.getMonth() + 1
        ).padStart(2, "0")}`;
        break;
      case "year":
        dateKey = `${bookingDate.getFullYear()}`;
        break;
      default:
        dateKey = `${bookingDate.getFullYear()}-${String(
          bookingDate.getMonth() + 1
        ).padStart(2, "0")}-${String(bookingDate.getDate()).padStart(2, "0")}`;
    }

    bookingsByDate[dateKey] = (bookingsByDate[dateKey] || 0) + 1;
  });

  // create graph data with all dates in order
  const graphData = {
    labels: allDateKeys,
    data: allDateKeys.map((key) => bookingsByDate[key]),
  };

  // stat data by province
  const whereClause: any = {
    isDeleted: false,
  };

  // If region is included: filter provinces by region
  // If province is also provided, only show that province (within the region)
  if (filter.region && filter.region !== "all") {
    const provincesInRegion = getProvincesByRegion(filter.region);

    if (provincesInRegion.length > 0) {
      // If province is provided, check if it's in the region and filter to only that province
      if (filter.province) {
        if (provincesInRegion.includes(filter.province)) {
          whereClause.location = {
            province: filter.province,
          };
        } else {
          // Province is not in the region, return empty result
          whereClause.location = {
            province: "__INVALID__", // This will match nothing
          };
        }
      } else {
        // No specific province, filter by all provinces in the region
        whereClause.location = {
          province: {
            in: provincesInRegion,
          },
        };
      }
    } else {
      // Invalid region, return empty result
      whereClause.location = {
        province: "__INVALID__", // This will match nothing
      };
    }
  } else if (filter.search) {
    // If search is provided (and region is not), search by province name
    whereClause.location = {
      province: {
        contains: filter.search,
      },
    };
  } else if (filter.province) {
    // If region and search are not provided but province is, filter by province
    whereClause.location = {
      province: filter.province,
    };
  }

  // get all communities with location
  const communities = await prisma.community.findMany({
    where: whereClause,
    include: {
      location: true,
      packages: {
        where: { isDeleted: false },
      },
    },
  });

  // group by province
  const provinceStats: { [key: string]: any } = {};

  for (const community of communities) {
    const provinceName = community.location.province;

    if (!provinceStats[provinceName]) {
      provinceStats[provinceName] = {
        province: provinceName,
        communityCount: 0,
        packageCount: 0,
        bookingCount: 0,
        successBookingCount: 0,
        cancelledBookingCount: 0,
      };
    }

    provinceStats[provinceName].communityCount += 1;
    provinceStats[provinceName].packageCount += community.packages.length;

    // get booking counts for packages in this community
    const packageIds = community.packages.map((pkg) => pkg.id);

    if (packageIds.length > 0) {
      const bookings = await prisma.bookingHistory.findMany({
        where: {
          packageId: { in: packageIds },
          bookingAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          status: true,
        },
      });

      provinceStats[provinceName].bookingCount += bookings.length;
      provinceStats[provinceName].successBookingCount += bookings.filter(
        (booking) => booking.status === "BOOKED"
      ).length;
      provinceStats[provinceName].cancelledBookingCount += bookings.filter(
        (booking) =>
          booking.status === "REFUNDED" || booking.status === "REFUND_REJECTED"
      ).length;
    }
  }

  // convert to array and paginate
  const statsArray = Object.values(provinceStats);
  const totalCount = statsArray.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginatedStats = statsArray.slice(skip, skip + limit);

  return {
    summary: {
      totalPackages,
      totalCommunities,
      successBookingCount,
      cancelledBookingCount,
    },
    graph: graphData,
    stats: {
      data: paginatedStats,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    },
  };
}

/**
 * คำอธิบาย : ฟังก์ชันช่วยเหลือเพื่อค้นหา communityId โดยใช้ userId
 * Input : userId (ID ของผู้ใช้)
 * Output : communityId หรือ null ถ้าไม่พบ
 */
async function findCommunityId(userId: number) {
  return await prisma.community.findFirst({
    where: {
      adminId: userId,
      isDeleted: false,
      deleteAt: null,
    },
    select: {
      id: true,
    },
  });
}
/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูล Dashboard ของ Admin
 * Input : dateStart, dateEnd, groupBy, userId
 * Output : ข้อมูล Dashboard ของ community ที่ admin ดูแล
 */
export async function getAdminDashboard(
  dateStart: string,
  dateEnd: string,
  groupBy: "hour" | "day" | "week" | "month" | "year" = "day",
  userId: number
) {
  const startDate = new Date(dateStart);
  const endDate = new Date(dateEnd);
  endDate.setHours(23, 59, 59, 999);

  const community = await findCommunityId(userId);

  if (!community) {
    return {
      totalPackages: 0,
      successBookingCount: 0,
      cancelledBookingCount: 0,
    };
  }

  // แพ็กเกจทั้งหมดใน community นั้น
  const totalPackages = await prisma.package.count({
    where: {
      communityId: community.id,
    },
  });

  // การจองที่สำเร็จทั้งหมดใน community นั้น
  const successBookingCount = await prisma.bookingHistory.count({
    where: {
      status: "BOOKED",
      package: {
        communityId: community.id,
      },
    },
  });

  // การจองที่ยกเลิกทั้งหมดใน community นั้น
  const cancelledBookingCount = await prisma.bookingHistory.count({
    where: {
      package: {
        communityId: community.id,
      },
      status: {
        in: ["REFUNDED", "REFUND_REJECTED"],
      },
    },
  });

  // รายได้รวมใน community นั้น
  const allBooked = await prisma.bookingHistory.findMany({
    where: {
      status: "BOOKED",
      package: {
        communityId: community.id,
      },
    },
    select: {
      totalParticipant: true,
      package: { select: { price: true } },
    },
  });

  // คำนวณรายได้รวม
  const totalRevenue = allBooked.reduce((sum, booking) => {
    return sum + (booking.package?.price || 0) * booking.totalParticipant;
  }, 0);

  const revenueByDate: Record<string, number> = {};
  const allDateKeys = generateDateRange(startDate, endDate, groupBy);
  allDateKeys.forEach((key) => (revenueByDate[key] = 0));

  // คำนวณรายได้แยกตามวันที่
  const revenueGraph = {
    labels: allDateKeys,
    data: allDateKeys.map((dateKey) => revenueByDate[dateKey]),
  };

  // count of bookingHistory in time (group by date) for graph
  const bookingHistories = await prisma.bookingHistory.findMany({
    where: {
      bookingAt: {
        gte: startDate,
        lte: endDate,
      },
      package: {
        communityId: community.id,
      },
    },
    select: {
      bookingAt: true,
    },
    orderBy: {
      bookingAt: "asc",
    },
  });

  // generate all date keys in the range
  const bookingsByDate: { [key: string]: number } = {};
  allDateKeys.forEach((dateKey) => {
    bookingsByDate[dateKey] = 0;
  });

  // count bookings for each date
  bookingHistories.forEach((booking) => {
    let dateKey: string;
    const bookingDate = new Date(booking.bookingAt);

    switch (groupBy) {
      case "hour":
        dateKey = `${bookingDate.getFullYear()}-${String(
          bookingDate.getMonth() + 1
        ).padStart(2, "0")}-${String(bookingDate.getDate()).padStart(
          2,
          "0"
        )} ${String(bookingDate.getHours()).padStart(2, "0")}:00`;
        break;
      case "day":
        dateKey = `${bookingDate.getFullYear()}-${String(
          bookingDate.getMonth() + 1
        ).padStart(2, "0")}-${String(bookingDate.getDate()).padStart(2, "0")}`;
        break;
      case "week":
        const weekStart = new Date(bookingDate);
        weekStart.setDate(bookingDate.getDate() - bookingDate.getDay());
        dateKey = `${weekStart.getFullYear()}-${String(
          weekStart.getMonth() + 1
        ).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
        break;
      case "month":
        dateKey = `${bookingDate.getFullYear()}-${String(
          bookingDate.getMonth() + 1
        ).padStart(2, "0")}`;
        break;
      case "year":
        dateKey = `${bookingDate.getFullYear()}`;
        break;
      default:
        dateKey = `${bookingDate.getFullYear()}-${String(
          bookingDate.getMonth() + 1
        ).padStart(2, "0")}-${String(bookingDate.getDate()).padStart(2, "0")}`;
    }

    bookingsByDate[dateKey] = (bookingsByDate[dateKey] || 0) + 1;
  });

  const bookingCountGraph = {
    labels: allDateKeys,
    data: allDateKeys.map((key) => bookingsByDate[key]),
  };

  // ค้นหาแพ็กเกจยอดนิยม 20 อันดับแรกใน community นั้น
  const topPackagesRaw = await prisma.bookingHistory.groupBy({
    by: ["packageId"],
    where: {
      package: {
        communityId: community.id,
      },
    },
    _count: {
      packageId: true,
    },
    orderBy: {
      _count: {
        packageId: "desc",
      },
    },
    take: 20,
  });

  // ดึงข้อมูลชื่อแพ็กเกจจากผล groupBy
  const packageIds = topPackagesRaw.map(
    (groupedPackage) => groupedPackage.packageId!
  );
  const packages = await prisma.package.findMany({
    where: { id: { in: packageIds } },
    select: { id: true, name: true },
  });

  // รวมชื่อกับจำนวนเข้าเป็น array เดียว
  const topPackages = topPackagesRaw.map((groupedPackage, index) => {
    const packageData = packages.find(
      (packageEntity) => packageEntity.id === groupedPackage.packageId
    );
    return {
      rank: index + 1,
      name: packageData?.name || "ไม่พบชื่อแพ็กเกจ",
      bookingCount: groupedPackage._count.packageId,
    };
  });

  return {
    summary: {
      totalPackages,
      totalRevenue,
      successBookingCount,
      cancelledBookingCount,
    },
    graph: {
      bookingCountGraph,
      revenueGraph,
    },
    topPackages,
  };
}
interface DashboardFilter {
  periodType: "weekly" | "monthly" | "yearly";
  dates?: string[];
}

/**
 * ฟังก์ชัน: calculateDateRanges
 * คำอธิบาย: ฟังก์ชันสำหรับคำนวณช่วงวันที่ตามประเภท
 * input: filter (periodType, dates)
 * output: { start: Date; end: Date; label: string }[]
 */
function calculateDateRanges(
  filter: DashboardFilter
): { start: Date; end: Date; label: string }[] {
  const dateRanges: { start: Date; end: Date; label: string }[] = [];

  if (!filter.dates || filter.dates.length === 0) return dateRanges;

  // วนลูปตามจำนวนวันที่ที่รับมา
  for (const dateString of filter.dates) {
    const targetDate = new Date(dateString);
    let rangeStartDate: Date, rangeEndDate: Date, rangeLabel: string;

    if (filter.periodType === "weekly") {
      rangeStartDate = new Date(targetDate);
      rangeStartDate.setHours(0, 0, 0, 0);
      rangeEndDate = new Date(rangeStartDate);
      rangeEndDate.setDate(rangeStartDate.getDate() + 6);
      rangeEndDate.setHours(23, 59, 59, 999);
      rangeLabel = `${rangeStartDate.getDate()}/${
        rangeStartDate.getMonth() + 1
      } - ${rangeEndDate.getDate()}/${rangeEndDate.getMonth() + 1}`;
    } else if (filter.periodType === "monthly") {
      rangeStartDate = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        1
      );
      rangeEndDate = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth() + 1,
        0
      );
      rangeEndDate.setHours(23, 59, 59, 999);
      const thaiMonths = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];
      rangeLabel = `${thaiMonths[rangeStartDate.getMonth()]} ${
        rangeStartDate.getFullYear() + 543
      }`;
    } else {
      // year
      rangeStartDate = new Date(targetDate.getFullYear(), 0, 1);
      rangeEndDate = new Date(targetDate.getFullYear(), 11, 31);
      rangeEndDate.setHours(23, 59, 59, 999);
      rangeLabel = `${rangeStartDate.getFullYear() + 543}`;
    }
    dateRanges.push({
      start: rangeStartDate,
      end: rangeEndDate,
      label: rangeLabel,
    });
  }
  return dateRanges;
}

/**
 * ฟังก์ชัน: buildGraphData
 * คำอธิบาย: ฟังก์ชันสำหรับสร้างข้อมูลกราฟ
 * input: userId, ranges, periodType, valueExtractor
 * output: { labels: string[]; datasets: { label: string; data: number[] }[] }
 */
async function buildGraphData(
  userId: number,
  dateRanges: { start: Date; end: Date; label: string }[],
  periodType: "weekly" | "monthly" | "yearly",
  valueExtractor: (booking: any) => number
) {
  // สร้างเงื่อนไข filter ตามช่วงวันที่ที่รับมา
  const dateFilters = dateRanges.map((range) => ({
    bookingAt: { gte: range.start, lte: range.end },
  }));

  // ดึงข้อมูล bookingHistory ตามเงื่อนไข filter
  const bookings = await prisma.bookingHistory.findMany({
    where: {
      package: { overseerMemberId: userId },
      ...(dateFilters.length > 0 ? { OR: dateFilters } : {}),
      status: "BOOKED",
    },
    select: {
      bookingAt: true,
      totalParticipant: true,
      package: { select: { price: true } },
    },
    orderBy: { bookingAt: "asc" },
  });

  let labels: string[] = [];
  let data: number[] = [];

  if (periodType === "monthly" && dateRanges.length === 1) {
    // Single Month -> Weekly breakdown
    const singleRange = dateRanges[0]!;
    let currentCheckDate = new Date(singleRange.start);
    let weekNumber = 1;
    const weeklyRanges: { start: Date; end: Date }[] = [];
    while (currentCheckDate <= singleRange.end) {
      const weekStartDate = new Date(currentCheckDate);
      const weekEndDate = new Date(currentCheckDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      if (weekEndDate > singleRange.end)
        weekEndDate.setTime(singleRange.end.getTime());

      weeklyRanges.push({ start: weekStartDate, end: weekEndDate });
      // Use Thai date format d/m-d/m for labels
      const label = `${weekStartDate.getDate()}/${
        weekStartDate.getMonth() + 1
      }-${weekEndDate.getDate()}/${weekEndDate.getMonth() + 1} ${
        weekEndDate.getFullYear() + 543
      }`;
      labels.push(label);

      currentCheckDate.setDate(currentCheckDate.getDate() + 7);
      weekNumber++;
    }
    const rangeData = weeklyRanges.map((week) => {
      return bookings
        .filter(
          (booking) =>
            new Date(booking.bookingAt) >= week.start &&
            new Date(booking.bookingAt) <= week.end
        )
        .reduce((total, booking) => total + valueExtractor(booking), 0);
    });
    data.push(...rangeData);
  } else if (periodType === "yearly" && dateRanges.length === 1) {
    // Single Year -> Monthly breakdown
    labels = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const rangeData = new Array(12).fill(0);
    bookings.forEach((booking) => {
      const date = new Date(booking.bookingAt);
      if (date >= dateRanges[0]!.start && date <= dateRanges[0]!.end) {
        // Ensure month index is valid
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          rangeData[monthIndex] += valueExtractor(booking);
        }
      }
    });
    data.push(...rangeData);
  } else if (periodType === "weekly") {
    // Week -> Daily breakdown
    // Generate dates based on the first range
    const firstRangeStart = dateRanges[0]?.start
      ? new Date(dateRanges[0].start)
      : new Date();
    labels = Array.from({ length: 7 }, (_, dayIndex) => {
      const generatedDate = new Date(firstRangeStart);
      generatedDate.setDate(generatedDate.getDate() + dayIndex);
      return `${generatedDate.getDate()}/${generatedDate.getMonth() + 1}`;
    });
    dateRanges.forEach((range) => {
      const rangeData = new Array(7).fill(0);
      bookings.forEach((booking) => {
        const date = new Date(booking.bookingAt);
        if (date >= range.start && date <= range.end) {
          const differenceInDays = Math.floor(
            (date.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (differenceInDays >= 0 && differenceInDays < 7)
            rangeData[differenceInDays] += valueExtractor(booking);
        }
      });
      data.push(...rangeData);
    });
  } else if (periodType === "monthly" && dateRanges.length > 1) {
    // Compare Months -> specific labels (e.g. "January", "December") and total data
    labels = dateRanges.map((dateRange) => dateRange.label);
    const rangeData = dateRanges.map((range) => {
      return bookings
        .filter((booking) => {
          const date = new Date(booking.bookingAt);
          return date >= range.start && date <= range.end;
        })
        .reduce((total, booking) => total + valueExtractor(booking), 0);
    });
    data.push(...rangeData);
  } else if (periodType === "yearly" && dateRanges.length > 1) {
    // Compare Years -> specific labels (e.g. "2566", "2567") and total data
    labels = dateRanges.map((dateRange) => dateRange.label);
    const rangeData = dateRanges.map((range) => {
      return bookings
        .filter((booking) => {
          const date = new Date(booking.bookingAt);
          return date >= range.start && date <= range.end;
        })
        .reduce((total, booking) => total + valueExtractor(booking), 0);
    });
    data.push(...rangeData);
  }

  return { labels, data };
}
/**
 * ฟังก์ชัน: getMemberDashboard
 * คำอธิบาย: ฟังก์ชันสำหรับดึงข้อมูล Dashboard ของ Member
 * Input: userId, bookingFilter, revenueFilter, packageFilter
 * Output: JSON response พร้อมข้อมูล Dashboard
 */
export async function getMemberDashboard(
  userId: number,
  bookingFilter: DashboardFilter,
  revenueFilter: DashboardFilter,
  packageFilter: DashboardFilter
) {
  const bookingRanges = calculateDateRanges(bookingFilter);
  const revenueRanges = calculateDateRanges(revenueFilter);
  const packageRanges = calculateDateRanges(packageFilter);

  // สร้างเงื่อนไขสำหรับการค้นหา Booking
  const bookingDateFilters = bookingRanges.map((range) => ({
    bookingAt: { gte: range.start, lte: range.end },
  }));

  // หาจำนวนแพคเกจที่ผู้ดูแล
  const totalPackages = await prisma.package.count({
    where: { overseerMemberId: userId },
  });

  // หาข้อมูล Booking
  const summaryBookings = await prisma.bookingHistory.findMany({
    where: {
      package: { overseerMemberId: userId },
      ...(bookingDateFilters.length > 0 ? { OR: bookingDateFilters } : {}),
    },
    select: {
      bookingAt: true,
      totalParticipant: true,
      status: true,
      package: { select: { price: true } },
    },
  });

  let totalRevenue = 0;
  let successBookingCount = 0;
  let cancelledBookingCount = 0;

  // คำนวนรายได้และจำนวน Booking
  summaryBookings.forEach((booking) => {
    if (booking.status === "BOOKED") {
      successBookingCount++;
      totalRevenue += (booking.package?.price || 0) * booking.totalParticipant;
    } else if (
      booking.status === "REFUNDED" ||
      booking.status === "REFUND_REJECTED"
    ) {
      cancelledBookingCount++;
    }
  });

  // สร้างกราฟ Booking
  const bookingCountGraph = await buildGraphData(
    userId,
    bookingRanges,
    bookingFilter.periodType,
    (booking: any) => 1 // Count 1 for each booking
  );

  // สร้างกราฟ Revenue
  const revenueGraph = await buildGraphData(
    userId,
    revenueRanges,
    revenueFilter.periodType,
    (booking: any) => (booking.package?.price || 0) * booking.totalParticipant // Calculate revenue
  );

  // หาแพคเกจที่ยอดจองเยอะที่สุด
  const packageDateFilters = packageRanges.map((range) => ({
    bookingAt: { gte: range.start, lte: range.end },
  }));

  const topPackagesRaw = await prisma.bookingHistory.groupBy({
    by: ["packageId"],
    where: {
      package: { overseerMemberId: userId },
      ...(packageDateFilters.length > 0 ? { OR: packageDateFilters } : {}),
      status: "BOOKED",
    },
    _count: {
      packageId: true,
    },
    orderBy: {
      _count: {
        packageId: "desc",
      },
    },
    take: 5,
  });

  // map packageId to packages
  const packageIds = topPackagesRaw.map(
    (groupedPackage) => groupedPackage.packageId!
  );

  const packages = await prisma.package.findMany({
    where: { id: { in: packageIds } },
    select: { id: true, name: true },
  });
  // ทำให้ข้อมูลที่ได้มาเป็น object ที่มี rank, name, bookingCount
  const topPackages = topPackagesRaw.map((groupedPackage, index) => {
    const packageData = packages.find(
      (packageEntity) => packageEntity.id === groupedPackage.packageId
    );
    return {
      rank: index + 1,
      name: packageData?.name || "-",
      bookingCount: groupedPackage._count.packageId,
    };
  });

  return {
    summary: {
      totalPackages,
      totalRevenue,
      successBookingCount,
      cancelledBookingCount,
    },
    graph: {
      bookingCountGraph,
      revenueGraph,
    },
    package: {
      topPackages,
    },
  };
}
