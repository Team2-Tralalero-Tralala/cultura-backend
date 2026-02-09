import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import * as DashboardDto from "~/Services/dashboard/dashboard-dto.js";
import * as DashboardService from "~/Services/dashboard/dashboard-service.js";

/*
 * DTO : getSuperAdminDashboardDto
 * วัตถุประสงค์ : สำหรับดึงข้อมูล Dashboard ของ Super Admin
 * Input : query (dateStart, dateEnd, page, limit, groupBy, province, region, search)
 * Output : ข้อมูล Dashboard
 */
export const getSuperAdminDashboardDto = {
  query: DashboardDto.GetSuperAdminDashboardDto,
} satisfies commonDto;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูล Dashboard ของ Super Admin
 * Input : req.query (dateStart, dateEnd, page, limit, groupBy, province, region, search)
 * Output : JSON response พร้อมข้อมูล Dashboard
 */
export const getSuperAdminDashboard: TypedHandlerFromDto<
  typeof getSuperAdminDashboardDto
> = async (req, res) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }

    const {
      dateStart,
      dateEnd,
      page = 1,
      limit = 10,
      groupBy = "day",
      province,
      region,
      search,
    } = req.query;

    const filter: { province?: string; region?: string; search?: string } = {};
    if (province) filter.province = province;
    if (region) filter.region = region;
    if (search) filter.search = search;

    const result = await DashboardService.getSuperAdminDashboardData(
      dateStart!,
      dateEnd!,
      page,
      limit,
      groupBy,
      filter
    );

    return createResponse(
      res,
      200,
      "Dashboard data retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูล Dashboard ของ Admin
 * Input : req.query (dateStart, dateEnd, groupBy, req.user.id)
 * Output : JSON response พร้อมข้อมูล Dashboard
 */
export const getAdminDashboard: TypedHandlerFromDto<
  typeof getMemberDashboardDto
> = async (req, res) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "User not authenticated");
    }

    const query = req.query as any;
    const { bookingPeriodType, revenuePeriodType, packagePeriodType } = query;

    const getArray = (key: string) => {
      const val = query[key] || query[`${key}[]`];
      return Array.isArray(val) ? val : val ? [val] : [];
    };

    const bookingDates = getArray("bookingDates");
    const revenueDates = getArray("revenueDates");
    const packageDates = getArray("packageDates");

    const toArray = (val: any) => (Array.isArray(val) ? val : val ? [val] : []);

    const result = await DashboardService.getAdminDashboard(
      req.user?.id,
      {
        periodType: bookingPeriodType as "weekly" | "monthly" | "yearly",
        dates: toArray(bookingDates),
      },
      {
        periodType: revenuePeriodType as "weekly" | "monthly" | "yearly",
        dates: toArray(revenueDates),
      },
      {
        periodType: packagePeriodType as "weekly" | "monthly" | "yearly",
        dates: toArray(packageDates),
      }
    );

    return createResponse(
      res,
      200,
      "Dashboard data retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
/*
 * DTO : getMemberDashboardDto
 * วัตถุประสงค์ : สำหรับดึงข้อมูล Dashboard ของ Member
 * Input : query (bookingPeriodType, bookingDates, revenuePeriodType, revenueDates, packagePeriodType, packageDates)
 * Output : ข้อมูล Dashboard
 */
export const getMemberDashboardDto = {
  query: DashboardDto.GetMemberDashboardDto,
} satisfies commonDto;
/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูล Dashboard ของ Member
 * Input : req.query (bookingPeriodType, bookingDates, revenuePeriodType, revenueDates, packagePeriodType, packageDates)
 * Output : JSON response พร้อมข้อมูล Dashboard
 */
export const getMemberDashboard: TypedHandlerFromDto<
  typeof getMemberDashboardDto
> = async (req, res) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "ผู้ใช้ไม่ได้เข้าสู่ระบบ");
    }

    const query = req.query as any;
    const { bookingPeriodType, revenuePeriodType, packagePeriodType } = query;

    const getArray = (key: string) => {
      const val = query[key] || query[`${key}[]`];
      return Array.isArray(val) ? val : val ? [val] : [];
    };

    const bookingDates = getArray("bookingDates");
    const revenueDates = getArray("revenueDates");
    const packageDates = getArray("packageDates");

    const toArray = (val: any) => (Array.isArray(val) ? val : val ? [val] : []);

    const result = await DashboardService.getMemberDashboard(
      req.user?.id,
      {
        periodType: bookingPeriodType as "weekly" | "monthly" | "yearly",
        dates: toArray(bookingDates),
      },
      {
        periodType: revenuePeriodType as "weekly" | "monthly" | "yearly",
        dates: toArray(revenueDates),
      },
      {
        periodType: packagePeriodType as "weekly" | "monthly" | "yearly",
        dates: toArray(packageDates),
      }
    );

    return createResponse(
      res,
      200,
      "Dashboard data retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
/*
 * DTO สำหรับดึงข้อมูล Dashboard ของ Tourist
 * วัตถุประสงค์ : เพื่อให้สามารถดึงข้อมูล Dashboard ของ Tourist ได้
 * คำอธิบาย : DTO สำหรับดึงข้อมูล Dashboard ของ Tourist
 * Input : query (bookingPeriodType, bookingDates)
 * Output : ข้อมูล Dashboard
 */
export const getTouristDashboardDto = {
  query: DashboardDto.GetTouristDashboardDto,
} satisfies commonDto;
/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูล Dashboard ของ Member
 * Input : req.query (bookingPeriodType, bookingDates, revenuePeriodType, revenueDates, packagePeriodType, packageDates)
 * Output : JSON response พร้อมข้อมูล Dashboard
 */
export const getTouristDashboard: TypedHandlerFromDto<
  typeof getTouristDashboardDto
> = async (req, res) => {
  try {
    if (!req.user) {
      return createErrorResponse(res, 401, "ผู้ใช้ไม่ได้เข้าสู่ระบบ");
    }

    const query = req.query as any;
    const { bookingPeriodType } = query;

    /**
     * คำอธิบาย : ฟังก์ชันสำหรับแปลงค่า query ให้เป็น array
     * Input : key (string)
     * Output : array
     */
    const convertBookingDateToArray = (key: string) => {
      const val = query[key] || query[`${key}[]`];
      return Array.isArray(val) ? val : val ? [val] : [];
    };

    const bookingDates = convertBookingDateToArray("bookingDates");

    const result = await DashboardService.getTouristDashboard(req.user?.id, {
      periodType: bookingPeriodType as "weekly" | "monthly" | "yearly",
      dates: bookingDates,
    });

    return createResponse(
      res,
      200,
      "Dashboard data retrieved successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
