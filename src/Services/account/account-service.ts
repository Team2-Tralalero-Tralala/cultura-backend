/*
 * Service: Account (สร้าง/แก้ไข)
 * - ตรวจเงื่อนไขทั้งหมดใน service (controller ไม่ if/else)
 * - โยน Error(message) ให้ controller แปลงเป็น response ตาม standard
 * - ไม่จับ Prisma รายกรณีที่นี่ (ให้ middleware/global handler ของโปรเจ็กต์ทำ)
 */

import prisma from "../database-service.js";
import bcrypt from "bcryptjs";
import type { CreateAccountDto, EditAccountDto } from "./account-dto.js";
import type { PaginationResponse } from "../pagination-dto.js";

/**
 * ฟิลด์ที่ “ปลอดภัย” สำหรับ select กลับไปให้ client
 * - ป้องกันการคืน password หรือข้อมูลภายในโดยไม่ตั้งใจ
 */
const selectSafe = {
  id: true,
  roleId: true,
  username: true,
  email: true,
  phone: true,
  fname: true,
  lname: true,
  profileImage: true,
  status: true,
  gender: true,
  birthDate: true,
  province: true,
  district: true,
  subDistrict: true,
  postalCode: true,
} as const;

/* -------------------------------------------------------------------------- */
/*                               CREATE ACCOUNT                               */
/* -------------------------------------------------------------------------- */
/**
 * ขั้นตอน:
 * 1) ตรวจ roleId ที่อ้างอิงว่ามีจริง
 * 2) กันข้อมูลซ้ำ (username/email/phone)
 * 3) hash password ก่อนเก็บ
 * 4) คืนเฉพาะฟิลด์ที่ปลอดภัย
 */
export async function createAccount(body: CreateAccountDto) {
  // 1) ตรวจ role ที่อ้างอิง
  const role = await prisma.role.findUnique({
    where: { id: body.roleId },
    select: { id: true, name: true },
  });
  if (!role) throw new Error("role_not_found");

  // 2) จำกัดเฉพาะ role ที่อนุญาตให้สร้างได้
  const allowedRoles = ["admin", "member", "tourist"];
  if (!allowedRoles.includes(role.name.toLowerCase())) {
    throw new Error("role_not_allowed");
  }

  // 3) ตรวจข้อมูลซ้ำ
  const dup = await prisma.user.findFirst({
    where: {
      OR: [
        { username: body.username },
        { email: body.email },
        { phone: body.phone },
      ],
    },
    select: { id: true },
  });
  if (dup) throw new Error("duplicate");

  // 4) hash password ก่อนเก็บ
  const created = await prisma.user.create({
    data: {
      roleId: role.id,
      fname: body.fname,
      lname: body.lname,
      username: body.username,
      email: body.email,
      phone: body.phone,
      password: await bcrypt.hash(body.password, 10),

      // ฟิลด์เพิ่มเติมตาม Role
      ...(body.gender && {
        gender:
          body.gender.toUpperCase() === "MALE"
            ? "MALE"
            : body.gender.toUpperCase() === "FEMALE"
            ? "FEMALE"
            : "NONE",
      }),
      ...(body.birthDate && { birthDate: new Date(body.birthDate) }),
      ...(body.province && { province: body.province }),
      ...(body.district && { district: body.district }),
      ...(body.subDistrict && { subDistrict: body.subDistrict }),
      ...(body.postalCode && { postalCode: body.postalCode }),
    },
    select: selectSafe,
  });

  return created;
}

/* -------------------------------------------------------------------------- */
/*                                EDIT ACCOUNT                                */
/* -------------------------------------------------------------------------- */
export async function editAccount(userId: number, body: EditAccountDto) {
  // 1) ตรวจ id
  if (!Number.isFinite(userId) || userId <= 0)
    throw new Error("invalid_user_id");

  // 2) ตรวจว่าผู้ใช้มีอยู่จริงไหม
  const exists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!exists) throw new Error("user_not_found");

  // 3) กันค่าซ้ำเฉพาะฟิลด์ที่ส่งมา
  if (body.username || body.email || body.phone) {
    const dup = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        OR: [
          ...(body.username ? [{ username: body.username }] : []),
          ...(body.email ? [{ email: body.email }] : []),
          ...(body.phone ? [{ phone: body.phone }] : []),
        ],
      },
      select: { id: true },
    });
    if (dup) throw new Error("duplicate");
  }

  // 4) ประกอบ data เฉพาะฟิลด์ที่ส่งมา
  const data: any = {
    ...(body.fname && { fname: body.fname }),
    ...(body.lname && { lname: body.lname }),
    ...(body.username && { username: body.username }),
    ...(body.email && { email: body.email }),
    ...(body.phone && { phone: body.phone }),
    ...(body.gender && { gender: body.gender as any }),
    ...(body.birthDate && { birthDate: new Date(body.birthDate) }),
    ...(body.province && { province: body.province }),
    ...(body.district && { district: body.district }),
    ...(body.subDistrict && { subDistrict: body.subDistrict }),
    ...(body.postalCode && { postalCode: body.postalCode }),
    ...(body.roleId && { roleId: body.roleId }),
  };

  // 5) หากส่ง password มา ให้ hash ก่อน
  if (body.password && body.password.trim() !== "") {
    data.password = await bcrypt.hash(body.password, 10);
  }

  // 5.5) ถ้ามีการเปลี่ยน role → ล้างข้อมูลฟิลด์ที่ไม่เกี่ยว
  if (body.roleId) {
    const role = await prisma.role.findUnique({
      where: { id: body.roleId },
      select: { name: true },
    });

    if (role?.name?.toLowerCase() === "admin") {
      // ล้างข้อมูล tourist/member
      data.gender = null;
      data.birthDate = null;
      data.province = null;
      data.district = null;
      data.subDistrict = null;
      data.postalCode = null;
    } else if (role?.name?.toLowerCase() === "member") {
      // ล้าง tourist fields
      data.gender = null;
      data.birthDate = null;
      data.province = null;
      data.district = null;
      data.subDistrict = null;
      data.postalCode = null;
    }
  }

  // 6) อัปเดต
  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: selectSafe,
  });

  return updated;
}

/* -------------------------------------------------------------------------- */
/*                              GET ACCOUNT BY ID                             */
/* -------------------------------------------------------------------------- */
export async function getAccountById(userId: number) {
  if (!Number.isFinite(userId) || userId <= 0)
    throw new Error("invalid_user_id");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...selectSafe,
      role: { select: { name: true } },
    },
  });

  if (!user) throw new Error("user_not_found");
  return user;
}

/* -------------------------------------------------------------------------- */
/*                                GET ALL USERS                               */
/* -------------------------------------------------------------------------- */
export const getAllUser = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> => {
  const skip = (page - 1) * limit;

  const [data, totalCount] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        fname: true,
        lname: true,
        username: true,
        email: true,
        phone: true,
        profileImage: true,
      },
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
    },
  };
};

/* -------------------------------------------------------------------------- */
/*                          GET MEMBER BY ADMIN ID                            */
/* -------------------------------------------------------------------------- */
export const getMemberByAdmin = async (adminId: number) => {
  // 1. หา community ของ admin คนนั้น
  const community = await prisma.community.findFirst({
    where: { adminId },
    select: { id: true },
  });

  if (!community) throw new Error("community_not_found_for_admin");

  // 2. ดึงสมาชิกจาก communityMembers ที่ belong กับ community นั้น
  const members = await prisma.communityMembers.findMany({
    where: { communityId: community.id },
    include: {
      user: {
        select: selectSafe,
      },
    },
  });

  // 3. ส่งเฉพาะข้อมูล user กลับ
  return members.map(({ user }) => user);
};

/* -------------------------------------------------------------------------- */
/*                            GET ALL ACCOUNT (SUPER)                         */
/* -------------------------------------------------------------------------- */
export const getAccountAll = async (id: number) => {
  if (!Number.isInteger(id)) throw new Error("ID must be number");

  // ตรวจสอบ user ที่ login
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user) throw new Error("user_not_found");

  // ตรวจ role
  if (user.role?.name.toLowerCase() !== "superadmin") {
    throw new Error("permission_denied");
  }

  // ดึง user ทั้งหมด
  const accounts = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      fname: true,
      lname: true,
      phone: true,
      status: true,
      role: { select: { id: true, name: true } },
    },
    orderBy: { id: "asc" },
  });

  return accounts;
};
