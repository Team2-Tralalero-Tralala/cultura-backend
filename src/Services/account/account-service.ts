/*
 * Service: Account
 * Description: บริการจัดการบัญชีผู้ใช้ (สร้าง แก้ไข ดึงข้อมูล)
 * Author: Team 2 (Cultura)
 * Last Modified: 21 ตุลาคม 2568
 */
import prisma from "../database-service.js";
import bcrypt from "bcrypt";
import type { CreateAccountDto, EditAccountDto } from "./account-dto.js";
import type { PaginationResponse } from "../pagination-dto.js";

/*
 * คำอธิบาย: ฟิลด์ที่ปลอดภัยสำหรับการ select กลับไปให้ client
 * ป้องกันการคืน password หรือข้อมูลภายในโดยไม่ตั้งใจ
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

/*
 * ฟังก์ชัน: createAccount
 * คำอธิบาย: สร้างบัญชีผู้ใช้ใหม่ และเข้ารหัสรหัสผ่านก่อนบันทึก
 * Input: CreateAccountDto
 * Output: ข้อมูลผู้ใช้ที่สร้างสำเร็จ (เฉพาะฟิลด์ที่ปลอดภัย)
 */

export async function createAccount(body: CreateAccountDto) {
  const role = await prisma.role.findUnique({
    where: { id: body.roleId },
    select: { id: true, name: true },
  });
  if (!role) throw new Error("role_not_found");

  const allowedRoles = ["admin", "member", "tourist"];
  if (!allowedRoles.includes(role.name.toLowerCase())) {
    throw new Error("role_not_allowed");
  }

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

  const created = await prisma.user.create({
    data: {
      roleId: role.id,
      fname: body.fname,
      lname: body.lname,
      username: body.username,
      email: body.email,
      phone: body.phone,
      password: await bcrypt.hash(body.password, 10),
      ...(body.profileImage && { profileImage: body.profileImage }),
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
  //  เพิ่มการบันทึกสมาชิกเข้าชุมชน (เฉพาะ Role = member)
  if (role.name.toLowerCase() === "member" && body.memberOfCommunity) {
    await prisma.communityMembers.create({
      data: {
        communityId: body.memberOfCommunity, // id ของชุมชนจากฟรอนต์เอนด์
        memberId: created.id, // id ของ user ที่เพิ่งสร้าง
      },
    });
  }

  return created;
}

/*
 * ฟังก์ชัน: editAccount
 * คำอธิบาย: แก้ไขข้อมูลบัญชีผู้ใช้ตาม ID และอัปเดตเฉพาะฟิลด์ที่ส่งมา
 * Input: userId, EditAccountDto
 * Output: ข้อมูลบัญชีที่ถูกอัปเดตแล้ว
 */
export async function editAccount(userId: number, body: EditAccountDto) {
  if (!Number.isFinite(userId) || userId <= 0)
    throw new Error("invalid_user_id");

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!targetUser) throw new Error("user_not_found");

  const allowedRoles = ["admin", "member", "tourist"];
  if (!allowedRoles.includes(targetUser.role.name.toLowerCase())) {
    throw new Error("forbidden_role_edit");
  }

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

  const data: any = {
    ...(body.fname && { fname: body.fname }),
    ...(body.lname && { lname: body.lname }),
    ...(body.username && { username: body.username }),
    ...(body.email && { email: body.email }),
    ...(body.phone && { phone: body.phone }),
    ...(body.profileImage && { profileImage: body.profileImage }),
    ...(body.gender && { gender: body.gender as any }),
    ...(body.birthDate && { birthDate: new Date(body.birthDate) }),
    ...(body.province && { province: body.province }),
    ...(body.district && { district: body.district }),
    ...(body.subdistrict && { subDistrict: body.subdistrict }),
    ...(body.postalCode && { postalCode: body.postalCode }),
    ...(body.roleId && { roleId: body.roleId }),
  };

  if (body.password && body.password.trim() !== "") {
    data.password = await bcrypt.hash(body.password, 10);
  }

  if (body.roleId) {
    const role = await prisma.role.findUnique({
      where: { id: body.roleId },
      select: { name: true },
    });

    if (role?.name?.toLowerCase() === "admin") {
      data.gender = null;
      data.birthDate = null;
      data.province = null;
      data.district = null;
      data.subDistrict = null;
      data.postalCode = null;
    } else if (role?.name?.toLowerCase() === "member") {
      data.gender = null;
      data.birthDate = null;
      data.province = null;
      data.district = null;
      data.subDistrict = null;
      data.postalCode = null;
    }
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: selectSafe,
  });

  return updated;
}

/*
 * ฟังก์ชัน: getAccountById
 * คำอธิบาย: ดึงข้อมูลบัญชีผู้ใช้ตาม ID
 * Input: userId
 * Output: ข้อมูลบัญชีผู้ใช้
 */
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
  const allowedRoles = ["admin", "member", "tourist"];

  if (!allowedRoles.includes(user.role?.name.toLowerCase())) {
    throw new Error("forbidden_role_access");
  }
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  return {
    ...user,
    profileImageUrl: user.profileImage
      ? `${baseUrl}/uploads/${user.profileImage}`
      : null,
  };
}

/*
 * ฟังก์ชัน: getAllUser
 * คำอธิบาย: ดึงข้อมูลผู้ใช้ทั้งหมดแบบแบ่งหน้า (Pagination)
 * Input: page, limit
 * Output: รายการผู้ใช้พร้อมข้อมูลแบ่งหน้า
 */
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
/*
 * ฟังก์ชัน: getMemberByAdmin
 * คำอธิบาย: ดึงข้อมูลสมาชิกในชุมชนของแอดมิน
 * Input: adminId
 * Output: รายการสมาชิกในชุมชน
 */
export const getMemberByAdmin = async (adminId: number) => {
  const community = await prisma.community.findFirst({
    where: { adminId },
    select: { id: true },
  });

  if (!community) throw new Error("community_not_found_for_admin");

  const members = await prisma.communityMembers.findMany({
    where: { communityId: community.id },
    include: {
      user: {
        select: selectSafe,
      },
    },
  });

  return members.map(({ user }) => user);
};
/*
 * ฟังก์ชัน: getAccountAll
 * คำอธิบาย: ดึงข้อมูลบัญชีผู้ใช้ทั้งหมด (เฉพาะ SuperAdmin)
 * Input: id (userId ของผู้ที่เรียก)
 * Output: รายการบัญชีผู้ใช้ทั้งหมด
 */
export const getAccountAll = async (id: number) => {
  if (!Number.isInteger(id)) throw new Error("ID must be number");

  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user) throw new Error("user_not_found");

  if (user.role?.name.toLowerCase() !== "superadmin") {
    throw new Error("permission_denied");
  }

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
/**
 * ประเภทข้อมูล: AccountInCommunity
 * คำอธิบาย: ประเภทข้อมูลสำหรับบัญชีผู้ใช้ที่อยู่ในชุมชน
 */
export type AccountInCommunity = {
  id: number;
  fname: string;
  lname: string;
  email: string;
  activityRole: string | null;
};
/**
 * ฟังก์ชัน: getAccountInCommunity
 * คำอธิบาย: ดึงข้อมูลบัญชีผู้ใช้ที่อยู่ในชุมชน
 * Input: communityId, page, limit, searchName
 * Output: รายการบัญชีผู้ใช้ที่อยู่ในชุมชน
 */
export async function getAccountInCommunity(
  communityId: number,
  page: number = 1,
  limit: number = 10,
  searchName?: string
): Promise<PaginationResponse<AccountInCommunity>> {
  const skip = (page - 1) * limit;
  const whereCondition: any = {};
  whereCondition.communityId = communityId;
  whereCondition.isDeleted = false;
  whereCondition.deleteAt = null;
  if (searchName) {
    whereCondition.OR = {
      user: {
        fname: {
          contains: searchName,
        },
        lname: {
          contains: searchName,
        },
        email: {
          contains: searchName,
        },
        activityRole: {
          contains: searchName,
        },
      },
    };
  }
  const accountInCommunity = await prisma.communityMembers.findMany({
    where: whereCondition,
    select: {
      user: {
        select: {
          id: true,
          fname: true,
          lname: true,
          email: true,
          activityRole: true,
          role: true,
        },
      },
    },
    skip,
    take: limit,
  });
  const totalCount = await prisma.communityMembers.count({
    where: whereCondition,
  });
  const totalPages = Math.ceil(totalCount / limit);
  return {
    data: accountInCommunity.map((item) => item.user),
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
    },
  };
}
