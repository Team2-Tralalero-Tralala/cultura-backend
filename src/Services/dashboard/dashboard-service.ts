import prisma from "../database-service.js";

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

    if (filter.province) {
      whereClause.location = {
        province: filter.province,
      };
    }

    if (filter.search) {
      whereClause.name = {
        contains: filter.search,
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
