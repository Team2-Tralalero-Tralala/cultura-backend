

import type { UserStatus } from "@prisma/client";
import prisma from "./database-service.js";
import type { PaginationResponse } from "~/Libs/Types/pagination-dto.js";


export async function getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
          username: true,
          email: true,
          fname: true,
          lname: true,
          phone: true,
          activityRole: true,
      },
    });
    if (!user) throw new Error("User not found");
    return user;
}


export async function getUserByStatus(
  status: UserStatus,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> {
    const skip = (page - 1) * limit;

    // นับจำนวนผู้ใช้ทั้งหมดตาม status
    const totalCount = await prisma.user.count({
        where: { status },
    });

    // ดึงข้อมูลผู้ใช้ตามหน้า
    const users = await prisma.user.findMany({
        where: { status },
        select: {
            id: true,
            username: true,
            activityRole: true,
            email: true,
        },
        orderBy: { id: "desc" },
        skip,
        take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
        data: users,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
        },
    };
}



export async function deleteAccount(userId: number) {
    const findUser = await prisma.user.findUnique({
      where: { id: userId}
    })
    if (!findUser) throw new Error("User not found");

    return await prisma.user.delete({
      where: { id: userId}
    });
}


export async function blockAccount(id: number) {
    const user = await prisma.user.update({
      where: { id },
      data: { status: "BLOCKED" },
      select: { 
        username: true,
        status: true,
      },
    });
    if (!user) throw new Error("User not found");

    return user;
}

export async function unblockAccount(id: number) {
    const user = await prisma.user.update({
      where: { id },
      data: { status: "ACTIVE" },
      select: { 
        username: true,
        status: true,
      },
    });
    if (!user) throw new Error("User not found");

    return user;
}
