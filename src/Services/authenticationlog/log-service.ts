/*
 * คำอธิบาย : Service สำหรับจัดการ Log ของผู้ใช้
 * ประกอบด้วยการดึงข้อมูล logs ตาม role, pagination, และการค้นหา/กรองข้อมูล
 * - superadmin เห็น logs ทั้งหมด
 * - admin เห็น logs ของสมาชิกในชุมชนของตนเองเท่านั้น
 * - รองรับการค้นหาตามชื่อผู้ใช้และกรองตาม role
 */

import type { UserPayload } from "~/Libs/Types/index.js";
import type { PaginationResponse } from "~/Services/pagination-dto.js";
import prisma from "../database-service.js";

/*
 * Type : LogWithUser
 * คำอธิบาย : Type สำหรับ log พร้อมข้อมูลผู้ใช้
 */
export type LogWithUser = {
    id: number;
    loginTime: Date | null;
    logoutTime: Date | null;
    ipAddress: string;
    user: {
        id: number;
        username: string;
        role: {
            id: number;
            name: string;
        };
    };
};

/*
 * ฟังก์ชัน : getUserLogs
 * คำอธิบาย : ดึงข้อมูล logs ตาม role ของผู้ใช้
 * Input :
 *   - user (UserPayload) - ข้อมูลผู้ใช้จาก token
 *   - page (number) - หน้าที่ต้องการ
 *   - limit (number) - จำนวนรายการต่อหน้า
 *   - searchName (string | undefined) - ค้นหาตามชื่อผู้ใช้
 *   - filterRole (string | undefined) - กรองตาม role ("all" = ทั้งหมด, อื่นๆ = กรองตาม role)
 *   - filterStartDate (string | undefined) - กรองตามวันที่เริ่มต้นในรูปแบบ YYYY-MM-DD
 *   - filterEndDate (string | undefined) - กรองตามวันที่สิ้นสุดในรูปแบบ YYYY-MM-DD
 * Output : PaginationResponse<LogWithUser>
 * Logic :
 *   - superadmin เห็นทุก log
 *   - admin เห็นเฉพาะ log ของสมาชิกในชุมชนที่ตนเป็น admin
 *   - รองรับการค้นหาและกรองข้อมูล
 *   - filterRole = "all" จะไม่กรอง role, อื่นๆจะกรองตาม role ที่ระบุ
 *   - filterStartDate และ filterEndDate จะกรองตามช่วงวันที่ที่ระบุ (loginTime หรือ logoutTime)
 */
export async function getUserLogs(
  user: UserPayload,
  page: number = 1,
  limit: number = 10,
  searchName?: string,
  filterRole?: string,
  filterStartDate?: string,
  filterEndDate?: string
): Promise<PaginationResponse<LogWithUser>> {
    const skip = (page - 1) * limit;

    // สร้าง where condition ตาม role
    let whereCondition: any = {};

    if (user.role.toLowerCase() === "superadmin") {
        // superadmin เห็นทุก log
    } else if (user.role.toLowerCase() === "admin") {
        // admin เห็นเฉพาะสมาชิกในชุมชนที่ตนเป็น admin
        // ต้องหาชุมชนที่ admin นี้เป็น admin ก่อน
        const adminCommunities = await prisma.community.findMany({
            where: {
                adminId: user.id,
            },
            select: { id: true },
        });

        const communityIds = adminCommunities.map((community) => community.id);

        if (communityIds.length === 0) {
            // ถ้าไม่เป็น admin ของชุมชนไหน ให้เห็นเฉพาะของตนเอง
            whereCondition.userId = user.id;
        } else {
            // เห็น logs ของสมาชิกในชุมชนที่เป็น admin
            const communityMembers = await prisma.user.findMany({
                where: { 
                    Community: { id: { in: communityIds } } 
                },
                select: { id: true },
            });

            const memberIds = communityMembers.map((member) => member.id);
            whereCondition.userId = { in: memberIds };
        }
    }

    // เพิ่ม filter สำหรับค้นหาชื่อผู้ใช้
    if (searchName) {
        whereCondition.user = {
            ...whereCondition.user,
            username: {
                contains: searchName,
            },
        };
    }

    // เพิ่ม filter สำหรับกรองตาม role (ถ้าไม่ใช่ "all")
    if (filterRole && filterRole.toLowerCase() !== "all") {
        whereCondition.user = {
            ...whereCondition.user,
            role: {
                name: filterRole,
            },
        };
    }

    // เพิ่ม filter สำหรับกรองตามช่วงวันที่
    if (filterStartDate || filterEndDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        
        // ตรวจสอบรูปแบบวันที่
        if (filterStartDate && !dateRegex.test(filterStartDate)) {
            throw new Error("รูปแบบวันที่เริ่มต้นไม่ถูกต้อง ต้องเป็น YYYY-MM-DD");
        }
        if (filterEndDate && !dateRegex.test(filterEndDate)) {
            throw new Error("รูปแบบวันที่สิ้นสุดไม่ถูกต้อง ต้องเป็น YYYY-MM-DD");
        }

        // สร้างช่วงวันที่
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (filterStartDate) {
            startDate = new Date(filterStartDate + "T00:00:00.000Z");
        }
        if (filterEndDate) {
            endDate = new Date(filterEndDate + "T23:59:59.999Z");
        }

        // สร้างเงื่อนไขการกรองตามช่วงวันที่
        const dateFilter: any = {};
        if (startDate) dateFilter.gte = startDate;
        if (endDate) dateFilter.lte = endDate;

        if (Object.keys(dateFilter).length > 0) {
            whereCondition.OR = [
                {
                    loginTime: dateFilter,
                },
                {
                    logoutTime: dateFilter,
                },
            ];
        }
    }

    // นับจำนวนรายการทั้งหมด
    const totalCount = await prisma.log.count({
        where: whereCondition,
    });

    // ดึงข้อมูล logs
    const logs = await prisma.log.findMany({
        where: whereCondition,
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    role: {
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
        skip,
        take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
        data: logs,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
        },
    };
}
