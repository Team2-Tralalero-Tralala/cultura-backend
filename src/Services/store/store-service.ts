import type { UserPayload } from "~/Libs/Types/index.js";
import { mapLocation } from "../community/community-service.js";
import prisma from "../database-service.js";
import type { StoreDto } from "./store-dto.js";
import type { PaginationResponse } from "../pagination-dto.js";

/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้าทั้งหมดที่อยู่ในชุมชนของผู้ใช้ที่มี role เป็น "admin"
 *            โดยดึงข้อมูลจาก community ที่ user สังกัดอยู่ (ผ่าน memberOfCommunity)
 *            ใช้สำหรับหน้ารวมร้านค้าในฝั่งผู้ดูแลชุมชน และรองรับการแบ่งหน้า (pagination)
 * Input :
 * - userId : number (รหัสผู้ใช้งาน ที่ต้องมี role เป็น admin และต้องสังกัดชุมชน)
 * - page : number (หน้าที่ต้องการแสดงผล เริ่มต้นที่ 1)
 * - limit : number (จำนวนรายการต่อหน้า เริ่มต้นที่ 10)
 *
 * Output :
 * - PaginationResponse : ประกอบด้วยข้อมูลร้านค้า (id, name, detail, tags)
 *   และ metadata สำหรับการแบ่งหน้า เช่น currentPage, totalPages, totalCount, limit
 */
export async function getAllStoreForAdmin(
    userId: number,
    page: number = 1,
    limit: number = 10
): Promise<PaginationResponse<any>> {
    if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error("User ID must be a number");
    }

    // ดึง user พร้อม role
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user) throw new Error("User not found");
    if (user.role?.name?.toLowerCase() !== "admin") {
        throw new Error("Forbidden: Only admin can access this resource");
    }

    // ดึง communityId จาก user.memberOfCommunity
    const communityId = user.memberOfCommunity;
    if (!communityId) {
        throw new Error("User is not assigned to any community");
    }

    const skip = (page - 1) * limit;

    const totalCount = await prisma.store.count({
        where: {
            isDeleted: false,
            communityId,
        },
    });

    const stores = await prisma.store.findMany({
        where: {
            isDeleted: false,
            communityId,
        },
        orderBy: { id: "asc" },
        skip,
        take: limit,
        select: {
            id: true,
            name: true,
            detail: true,
            tagStores: {
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
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
        data: stores,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
        },
    };
}
