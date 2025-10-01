import prisma from "./database-service.js";
import type { PaginationResponse } from "./pagination-dto.js";

export const getMemberByAdmin = async (id: number) => {
  if (!Number.isInteger(id)) {
    throw new Error("ID must be Number");
  }

  // ตรวจสอบ user
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");

  if (user.role?.name.toLowerCase() !== "admin") {
    throw new Error("Permission denied: only admin can access members");
  }

  // หาชุมชนที่ admin ดูแล
  const community = await prisma.community.findUnique({
    where: { adminId: user.id },
    select: { id: true },
  });
  if (!community) {
    throw new Error("Community not found for this admin");
  }

  // ดึงสมาชิกใน community นี้
  const members = await prisma.user.findMany({
    where: { memberOfCommunity: community.id },
    select: {
      id: true,
      fname: true,
      lname: true,
      email: true,
      activityRole: true,
    },
    orderBy: { fname: "asc" },
  });

  return members;
};
export const getAccountAll = async (id: number) => {
  if (!Number.isInteger(id)) {
    throw new Error("ID must be Number");
  }

  // ตรวจสอบ user ที่ login
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");

  // ตรวจ role
  if (user.role?.name.toLowerCase() !== "superadmin") {
    throw new Error("Permission denied: only superadmin can access all accounts");
  }

  // ✅ ดึง user ทั้งหมด (เลือกฟิลด์ตามต้องการ)
  const accounts = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      fname: true,
      lname: true,
      phone: true,
      status: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return accounts;
};
// export const getMemberByAdmin = async (
//   userId: number,
//   page: number = 1,
//   limit: number = 10
// ): Promise<PaginationResponse<any>> => {
//   if (isNaN(userId)) {
//     throw new Error(`User ID ${userId} ไม่ถูกต้อง`);
//   }

//   const skip = (page - 1) * limit;

//   // 1) หา communities ที่ userId นี้เป็น admin อยู่
//   const admin = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       fname: true,
//       lname: true,
//       email: true,
//       activityRole: true,
//       communitiesAdmin: true,
//     }
//   });

//   if (!admin) {
//     throw new Error(`ไม่พบผู้ใช้ ID ${userId}`);
//   }
//   console.log(admin);
//  return {
//       data: [],
//       pagination: {
//         currentPage: page,
//         totalPages: 0,
//         totalCount: 0,
//         limit,
//       },
//     };
//   // 2) ดึง users ที่เป็น member ของ communities เหล่านี้
//   const totalCount = await prisma.user.count({
//     where: {
//       memberOfCommunity: { in: communityIds }
//     }
//   });

//   const members = await prisma.user.findMany({
//     where: {
//       memberOfCommunity: { in: communityIds }
//     },
//     include: { role: true, memberOf: true }, // เพิ่มข้อมูล role และชุมชน
//     skip,
//     take: limit,
//   });

//   const totalPages = Math.ceil(totalCount / limit);

//   return {
//     data: members,
//     pagination: {
//       currentPage: page,
//       totalPages,
//       totalCount,
//       limit,
//     },
//   };
// };
