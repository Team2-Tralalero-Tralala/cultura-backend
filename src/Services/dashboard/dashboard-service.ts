import prisma from "../database-service.js";

/*
 * คำอธิบาย : แผนที่จังหวัดตามภาคของประเทศไทย
 */
const REGION_TO_PROVINCES: { [key: string]: string[] } = {
  // English values from frontend
  "north": ["เชียงใหม่", "เชียงราย", "น่าน", "พะเยา", "แพร่", "แม่ฮ่องสอน", "ลำปาง", "ลำพูน", "อุตรดิตถ์"],
  "central": ["กรุงเทพมหานคร", "กาญจนบุรี", "ตาก", "นครปฐม", "นครสวรรค์", "นนทบุรี", "ปทุมธานี", "พระนครศรีอยุธยา", "พิจิตร", "พิษณุโลก", "เพชรบูรณ์", "ลพบุรี", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "อ่างทอง", "อุทัยธานี"],
  "northeast": ["กาฬสินธุ์", "ขอนแก่น", "ชัยภูมิ", "นครพนม", "นครราชสีมา", "บึงกาฬ", "บุรีรัมย์", "มหาสารคาม", "มุกดาหาร", "ยโสธร", "ร้อยเอ็ด", "เลย", "ศรีสะเกษ", "สกลนคร", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อำนาจเจริญ", "อุดรธานี", "อุบลราชธานี"],
  "south": ["กระบี่", "ชุมพร", "ตรัง", "นครศรีธรรมราช", "นราธิวาส", "ปัตตานี", "พังงา", "พัทลุง", "ภูเก็ต", "ยะลา", "ระนอง", "สงขลา", "สตูล", "สุราษฎร์ธานี"],
  // Thai values (for backward compatibility)
  "เหนือ": ["เชียงใหม่", "เชียงราย", "น่าน", "พะเยา", "แพร่", "แม่ฮ่องสอน", "ลำปาง", "ลำพูน", "อุตรดิตถ์"],
  "ตะวันออก": ["จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ตราด", "ปราจีนบุรี", "ระยอง", "สระแก้ว"],
  "กลาง": ["กรุงเทพมหานคร", "กาญจนบุรี", "ตาก", "นครปฐม", "นครสวรรค์", "นนทบุรี", "ปทุมธานี", "พระนครศรีอยุธยา", "พิจิตร", "พิษณุโลก", "เพชรบูรณ์", "ลพบุรี", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "อ่างทอง", "อุทัยธานี"],
  "ตะวันตก": ["กาญจนบุรี", "ตาก", "ประจวบคีรีขันธ์", "เพชรบุรี", "ราชบุรี"],
  "ใต้": ["กระบี่", "ชุมพร", "ตรัง", "นครศรีธรรมราช", "นราธิวาส", "ปัตตานี", "พังงา", "พัทลุง", "ภูเก็ต", "ยะลา", "ระนอง", "สงขลา", "สตูล", "สุราษฎร์ธานี"],
  "อีสาน": ["กาฬสินธุ์", "ขอนแก่น", "ชัยภูมิ", "นครพนม", "นครราชสีมา", "บึงกาฬ", "บุรีรัมย์", "มหาสารคาม", "มุกดาหาร", "ยโสธร", "ร้อยเอ็ด", "เลย", "ศรีสะเกษ", "สกลนคร", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อำนาจเจริญ", "อุดรธานี", "อุบลราชธานี"],
  "ภาคเหนือ": ["เชียงใหม่", "เชียงราย", "น่าน", "พะเยา", "แพร่", "แม่ฮ่องสอน", "ลำปาง", "ลำพูน", "อุตรดิตถ์"],
  "ภาคตะวันออก": ["จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ตราด", "ปราจีนบุรี", "ระยอง", "สระแก้ว"],
  "ภาคกลาง": ["กรุงเทพมหานคร", "กาญจนบุรี", "ตาก", "นครปฐม", "นครสวรรค์", "นนทบุรี", "ปทุมธานี", "พระนครศรีอยุธยา", "พิจิตร", "พิษณุโลก", "เพชรบูรณ์", "ลพบุรี", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "อ่างทอง", "อุทัยธานี"],
  "ภาคตะวันตก": ["กาญจนบุรี", "ตาก", "ประจวบคีรีขันธ์", "เพชรบุรี", "ราชบุรี"],
  "ภาคใต้": ["กระบี่", "ชุมพร", "ตรัง", "นครศรีธรรมราช", "นราธิวาส", "ปัตตานี", "พังงา", "พัทลุง", "ภูเก็ต", "ยะลา", "ระนอง", "สงขลา", "สตูล", "สุราษฎร์ธานี"],
  "ภาคอีสาน": ["กาฬสินธุ์", "ขอนแก่น", "ชัยภูมิ", "นครพนม", "นครราชสีมา", "บึงกาฬ", "บุรีรัมย์", "มหาสารคาม", "มุกดาหาร", "ยโสธร", "ร้อยเอ็ด", "เลย", "ศรีสะเกษ", "สกลนคร", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อำนาจเจริญ", "อุดรธานี", "อุบลราชธานี"],
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
        dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')} ${String(current.getHours()).padStart(2, '0')}:00`;
        current.setHours(current.getHours() + 1);
        break;
      case "day":
        dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        current.setDate(current.getDate() + 1);
        break;
      case "week":
        const weekStart = new Date(current);
        weekStart.setDate(current.getDate() - current.getDay());
        dateKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        current.setDate(current.getDate() + 7);
        break;
      case "month":
        dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
        break;
      case "year":
        dateKey = `${current.getFullYear()}`;
        current.setFullYear(current.getFullYear() + 1);
        break;
      default:
        dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
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
      province?: string,
      region?: string,
      search?: string
    } = {},
) {
    const skip = (page - 1) * limit;

    // validate dateStart and dateEnd
    if (!dateStart.trim() || !dateEnd.trim()) {
      throw new Error("dateStart and dateEnd are required");
    }

    // validate dateStart and dateEnd format
    if (!dateStart.match(/^\d{4}-\d{2}-\d{2}$/) || !dateEnd.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error("dateStart and dateEnd must be in format yyyy-mm-dd");
    }

    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);
    endDate.setHours(23, 59, 59, 999);

    // count of all packages
    const totalPackages = await prisma.package.count({
      where: { isDeleted: false }
    });

    // count of all communities
    const totalCommunities = await prisma.community.count({
      where: { isDeleted: false }
    });

    // count of success booking (status = BOOKED)
    const successBookingCount = await prisma.bookingHistory.count({
      where: {
        status: "BOOKED",
        bookingAt: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    // count of cancelled booking (status = REFUNDED or REFUND_REJECTED)
    const cancelledBookingCount = await prisma.bookingHistory.count({
      where: {
        status: {
          in: ["REFUNDED", "REFUND_REJECTED"]
        },
        bookingAt: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    // count of bookingHistory in time (group by date) for graph
    const bookingHistories = await prisma.bookingHistory.findMany({
      where: {
        bookingAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      select: {
        bookingAt: true,
      },
      orderBy: {
        bookingAt: 'asc',
      }
    });

    // generate all date keys in the range
    const allDateKeys = generateDateRange(startDate, endDate, groupBy);

    // group bookings by date
    const bookingsByDate: { [key: string]: number } = {};
    
    // initialize all dates with 0
    allDateKeys.forEach(dateKey => {
      bookingsByDate[dateKey] = 0;
    });

    // count bookings for each date
    bookingHistories.forEach((booking) => {
      let dateKey: string;
      const bookingDate = new Date(booking.bookingAt);

      switch (groupBy) {
        case "hour":
          dateKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${String(bookingDate.getDate()).padStart(2, '0')} ${String(bookingDate.getHours()).padStart(2, '0')}:00`;
          break;
        case "day":
          dateKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${String(bookingDate.getDate()).padStart(2, '0')}`;
          break;
        case "week":
          const weekStart = new Date(bookingDate);
          weekStart.setDate(bookingDate.getDate() - bookingDate.getDay());
          dateKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
          break;
        case "month":
          dateKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        case "year":
          dateKey = `${bookingDate.getFullYear()}`;
          break;
        default:
          dateKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${String(bookingDate.getDate()).padStart(2, '0')}`;
      }

      bookingsByDate[dateKey] = (bookingsByDate[dateKey] || 0) + 1;
    });

    // create graph data with all dates in order
    const graphData = {
      labels: allDateKeys,
      data: allDateKeys.map(key => bookingsByDate[key]),
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
      const packageIds = community.packages.map(pkg => pkg.id);
      
      if (packageIds.length > 0) {
        const bookings = await prisma.bookingHistory.findMany({
          where: {
            packageId: { in: packageIds },
            bookingAt: {
              gte: startDate,
              lte: endDate,
            }
          },
          select: {
            status: true,
          }
        });

        provinceStats[provinceName].bookingCount += bookings.length;
        provinceStats[provinceName].successBookingCount += bookings.filter(b => b.status === "BOOKED").length;
        provinceStats[provinceName].cancelledBookingCount += bookings.filter(b => b.status === "REFUNDED" || b.status === "REFUND_REJECTED").length;
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
        }
      }
    };
}
/**
 * คำอธิบาย : ฟังก์ชันช่วยเหลือเพื่อค้นหา communityId โดยใช้ userId ของ admin
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
export async function getAdminDashBoard(
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
  const totalRevenue = allBooked.reduce((sum, b) => {
    return sum + (b.package?.price || 0) * b.totalParticipant;
  }, 0);

  const revenueByDate: Record<string, number> = {};
  const allDateKeys = generateDateRange(startDate, endDate, groupBy);
  allDateKeys.forEach((key) => (revenueByDate[key] = 0));

  // คำนวณรายได้แยกตามวันที่
  const revenueGraph = {
    labels: allDateKeys,
    data: allDateKeys.map((k) => revenueByDate[k]),
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
  const packageIds = topPackagesRaw.map((pkg) => pkg.packageId!);
  const packages = await prisma.package.findMany({
    where: { id: { in: packageIds } },
    select: { id: true, name: true },
  });

  // รวมชื่อกับจำนวนเข้าเป็น array เดียว
  const topPackages = topPackagesRaw.map((item, index) => {
    const pkg = packages.find((pkg) => pkg.id === item.packageId);
    return {
      rank: index + 1,
      name: pkg?.name || "ไม่พบชื่อแพ็กเกจ",
      bookingCount: item._count.packageId,
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
