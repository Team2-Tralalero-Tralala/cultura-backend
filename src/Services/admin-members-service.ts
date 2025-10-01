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

  // ดึง user ทั้งหมด (เลือกฟิลด์ตามต้องการ)
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

