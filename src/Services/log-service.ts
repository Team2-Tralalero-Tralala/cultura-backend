/*
 * คำอธิบาย : Service สำหรับจัดการ Log ของผู้ใช้
 * ประกอบด้วยการดึงข้อมูล logs ตาม role และ pagination
 * - superadmin เห็น logs ทั้งหมด
 * - admin เห็น logs ของสมาชิกในชุมชนของตนเองเท่านั้น
 */

import type { UserPayload } from "~/Libs/Types/index.js";
import type { PaginationResponse } from "~/Libs/Types/pagination-dto.js";
import prisma from "./database-service.js";

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
 *   - search (string, optional) - คำค้นหา (username, email)
 * Output : PaginationResponse<LogWithUser>
 * Logic :
 *   - superadmin เห็นทุก log
 *   - admin เห็นเฉพาะ log ของสมาชิกในชุมชนที่ตนเป็น admin
 *   - member/tourist เห็นเฉพาะ log ของตนเอง
 */
export async function getUserLogs(
    user: UserPayload,
    page: number = 1,
    limit: number = 10
): Promise<PaginationResponse<LogWithUser>> {
    const skip = (page - 1) * limit;

    // สร้าง where condition ตาม role
    let whereCondition: any = {};

    if (user.role.toLowerCase() === "superadmin") {
        // superadmin เห็นทุก log
    } else if (user.role.toLowerCase() === "admin") {
        // admin เห็นเฉพาะสมาชิกในชุมชนที่ตนเป็น admin
        // ต้องหาชุมชนที่ admin นี้เป็นสมาชิกก่อน
        const adminCommunities = await prisma.communityMember.findMany({
            where: {
                memberId: user.id,
                role: { name: "admin" },
            },
            select: { communityId: true },
        });

        const communityIds = adminCommunities.map((cm) => cm.communityId);

        if (communityIds.length === 0) {
            // ถ้าไม่เป็น admin ของชุมชนไหน ให้เห็นเฉพาะของตนเอง
            whereCondition.userId = user.id;
        } else {
            // เห็น logs ของสมาชิกในชุมชนที่เป็น admin
            const communityMemberIds = await prisma.communityMember.findMany({
                where: { communityId: { in: communityIds } },
                select: { memberId: true },
            });

            const memberIds = communityMemberIds.map((cm) => cm.memberId);
            whereCondition.userId = { in: memberIds };
        }
    } else {
        // member หรือ tourist เห็นเฉพาะของตนเอง
        whereCondition.userId = user.id;
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
