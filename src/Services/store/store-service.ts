import type { UserPayload } from "~/Libs/Types/index.js";
import { mapLocation } from "../community/community-service.js";
import prisma from "../database-service.js";
import type { StoreDto } from "./store-dto.js";
import type { PaginationResponse } from "../pagination-dto.js";

/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้าทั้งหมดที่อยู่ในชุมชนตาม communityId
 *            ใช้สำหรับหน้ารวมร้านค้าในแต่ละชุมชน และรองรับการแบ่งหน้า (pagination)
 * Input :
 * - communityId : number (รหัสชุมชนที่ต้องการดึงร้านค้า)
 * - page : number (หน้าที่ต้องการแสดงผล เริ่มต้นที่ 1)
 * - limit : number (จำนวนรายการต่อหน้า เริ่มต้นที่ 10)
 * Output :
 * - PaginationResponse : ประกอบด้วยข้อมูลร้านค้า (id, name, detail, tags)
 *   และ metadata สำหรับการแบ่งหน้า เช่น currentPage, totalPages, totalCount, limit
 */

export const getAllStore = async (
    communityId: number,
    page: number = 1,
    limit: number = 10
): Promise<PaginationResponse<any>> => {
    if (!Number.isInteger(communityId)) {
        throw new Error("Community ID must be a number");
    }

    const skip = (page - 1) * limit;

    const totalCount = await prisma.store.count({
        where: {
            isDeleted: false,
            communityId, // ดึงเฉพาะร้านในชุมชนนั้น
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
};
