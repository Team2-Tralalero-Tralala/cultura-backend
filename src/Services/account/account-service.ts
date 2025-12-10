/*
 * Service: Account
 * Description: บริการจัดการบัญชีผู้ใช้ (สร้าง แก้ไข ดึงข้อมูล)
 * Author: Team 2 (Cultura)
 * Last Modified: 2 ธันวาคม 2568
 */
import prisma from "../database-service.js";
import bcrypt from "bcrypt";
import {
  ProfileDto,
  type CreateAccountDto,
  type EditAccountDto,
} from "./account-dto.js";
import type { PaginationResponse } from "../pagination-dto.js";
import { Prisma } from "@prisma/client";

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
  activityRole: true,
} as const;

/*
 * ฟังก์ชัน: createAccount
 * คำอธิบาย: สร้างบัญชีผู้ใช้ใหม่ และเข้ารหัสรหัสผ่านก่อนบันทึก
 * [Modified]: ปรับปรุงให้รองรับการ Connect Role ด้วย Name (แก้ปัญหา Role ID เปลี่ยน)
 */
export async function createAccount(body: CreateAccountDto) {
  // 1. เตรียม Role Connect (แก้ปัญหา Seed แล้ว ID เปลี่ยน)
  // ถ้ามี roleId ส่งมา (เช่น SuperAdmin สร้าง) ให้ใช้ ID
  // ถ้าไม่มี roleId (เช่น Admin สร้าง Member) ให้ใช้ชื่อ "MEMBER"
  let roleConnect;
  let roleNameCheck = "";

  if (body.roleId) {
    roleConnect = { id: Number(body.roleId) };
    // เช็ค Role เพื่อความชัวร์ (เหมือนเดิม)
    const role = await prisma.role.findUnique({ where: { id: body.roleId } });
    if (!role) throw new Error("role_not_found");
    roleNameCheck = role.name;
  } else {
    // ถ้าไม่มี roleId ให้ Default เป็น MEMBER โดยใช้ Name
    roleConnect = { name: "MEMBER" };
    roleNameCheck = "member";
  }

  // 2. Validate Allowed Roles
  const allowedRoles = ["admin", "member", "tourist"];
  if (!allowedRoles.includes(roleNameCheck.toLowerCase())) {
    throw new Error("role_not_allowed");
  }

  // 3. Check Duplicate
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

  // แยก roleId ออกจาก body เพราะเราจะใช้ connect แทน
  const { roleId, ...restBody } = body;

  // 4. Create User
  const created = await prisma.user.create({
    data: {
      role: {
        connect: roleConnect, // <--- ใช้ connect แทนการใส่ roleId ตรงๆ
      },
      fname: restBody.fname,
      lname: restBody.lname,
      username: restBody.username,
      email: restBody.email,
      phone: restBody.phone,
      password: await bcrypt.hash(restBody.password, 10),
      ...(restBody.profileImage && { profileImage: restBody.profileImage }),
      ...(restBody.communityRole && { activityRole: restBody.communityRole }),
      ...(restBody.gender && {
        gender:
          restBody.gender.toUpperCase() === "MALE"
            ? "MALE"
            : restBody.gender.toUpperCase() === "FEMALE"
            ? "FEMALE"
            : "NONE",
      }),
      ...(restBody.birthDate && { birthDate: new Date(restBody.birthDate) }),
      ...(restBody.province && { province: restBody.province }),
      ...(restBody.district && { district: restBody.district }),
      ...(restBody.subDistrict && { subDistrict: restBody.subDistrict }),
      ...(restBody.postalCode && { postalCode: restBody.postalCode }),
    },
    select: selectSafe,
  });

  // 5. เพิ่มการบันทึกสมาชิกเข้าชุมชน (เฉพาะ Role = member)
  if (roleNameCheck.toLowerCase() === "member" && body.memberOfCommunity) {
    await prisma.communityMembers.create({
      data: {
        communityId: body.memberOfCommunity,
        memberId: created.id,
      },
    });
  }

  return {
    ...created,
    memberOfCommunity: body.memberOfCommunity || null,
  };
}

/*
 * ฟังก์ชัน: editAccount
 * คำอธิบาย: แก้ไขข้อมูลบัญชีผู้ใช้ตาม ID และอัปเดตเฉพาะฟิลด์ที่ส่งมา
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

  // Check Duplicate
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

  // Prepare Data
  const data: any = {
    ...(body.fname && { fname: body.fname }),
    ...(body.lname && { lname: body.lname }),
    ...(body.username && { username: body.username }),
    ...(body.email && { email: body.email }),
    ...(body.phone && { phone: body.phone }),
    ...(body.profileImage && { profileImage: body.profileImage }),
    ...(body.communityRole && { activityRole: body.communityRole }),
    ...(body.gender && { gender: body.gender as any }),
    ...(body.birthDate && { birthDate: new Date(body.birthDate) }),
    ...(body.province && { province: body.province }),
    ...(body.district && { district: body.district }),
    ...(body.subDistrict && { subDistrict: body.subDistrict }),
    ...(body.postalCode && { postalCode: body.postalCode }),
    ...(body.roleId && { roleId: body.roleId }),
  };

  if (body.password && body.password.trim() !== "") {
    data.password = await bcrypt.hash(body.password, 10);
  }

  // Logic เคลียร์ข้อมูลเมื่อเปลี่ยน Role
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

  // อัปเดตตาราง CommunityMembers ถ้ามีการเปลี่ยนชุมชน (สำหรับ Member)
  if (
    targetUser.role.name.toLowerCase() === "member" &&
    body.memberOfCommunity
  ) {
    await prisma.communityMembers.deleteMany({
      where: { memberId: userId },
    });

    await prisma.communityMembers.create({
      data: {
        communityId: body.memberOfCommunity,
        memberId: userId,
      },
    });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: selectSafe,
  });

  return {
    ...updated,
    memberOfCommunity: body.memberOfCommunity || null,
  };
}

/*
 * ฟังก์ชัน: getAccountById
 * คำอธิบาย: ดึงข้อมูลบัญชีผู้ใช้ตาม ID
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

  let memberOfCommunity = null;
  if (user.role?.name.toLowerCase() === "member") {
    const communityMember = await prisma.communityMembers.findFirst({
      where: { memberId: userId },
      select: { communityId: true },
    });
    if (communityMember) {
      memberOfCommunity = communityMember.communityId;
    }
  }

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  return {
    ...user,
    memberOfCommunity,
    profileImageUrl: user.profileImage
      ? `${baseUrl}/uploads/${user.profileImage}`
      : null,
  };
}

/*
 * ฟังก์ชัน: getAllUser
 * คำอธิบาย: ดึงข้อมูลผู้ใช้ทั้งหมดแบบแบ่งหน้า
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

export type AccountInCommunity = {
  id: number;
  fname: string;
  lname: string;
  email: string;
  activityRole: string | null;
};

/*
 * ฟังก์ชัน: getAccountInCommunity
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
        fname: { contains: searchName },
        lname: { contains: searchName },
        email: { contains: searchName },
        activityRole: { contains: searchName },
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

/*
 * ฟังก์ชัน: getCommunityIdByAdminId
 * คำอธิบาย: ช่วยหาว่า Admin คนนี้ดูแลชุมชน ID อะไร
 */
export async function getCommunityIdByAdminId(adminId: number) {
  const community = await prisma.community.findFirst({
    where: { adminId: adminId },
    select: { id: true },
  });

  if (!community) throw new Error("community_not_found_for_admin");
  return community.id;
}
export async function getMe(userId: number) {
  return await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false,
      deleteAt: null,
    },
    include: {
      role: true,
    },
  });
}

/**
 * ฟังก์ชัน : editProfile
 * คำอธิบาย :
 *   ใช้สำหรับแก้ไขข้อมูลโปรไฟล์ของผู้ใช้งานในตาราง users
 *   จะอัปเดตเฉพาะฟิลด์ที่ถูกส่งมาใน data เท่านั้น (partial update)
 *
 * Input :
 *   - userId : number
 *       รหัสผู้ใช้งานที่ต้องการแก้ไข (ต้องเป็นบัญชีที่ยังไม่ถูกลบ)
 *   - data   : EditAccountDto
 *       ข้อมูลโปรไฟล์ที่ต้องการแก้ไข เช่น ชื่อ, นามสกุล, อีเมล, เบอร์โทร ฯลฯ
 *
 * Output :
 *   - อัปเดตข้อมูลผู้ใช้งานในฐานข้อมูลสำเร็จ (ถ้าไม่เกิด error)
 *   - กรณี error :
 *       - throw Error("ไม่พบสมาชิก") หากไม่พบ user ตาม userId
 *       - throw Error("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว") กรณี username ซ้ำ
 *       - throw Error("อีเมลนี้ถูกใช้งานแล้ว") กรณี email ซ้ำ
 *       - throw Error("หมายเลขโทรศัพท์นี้ถูกใช้งานแล้ว") กรณีเบอร์โทรซ้ำ
 *       - throw Error("ข้อมูลซ้ำในระบบ") กรณี unique constraint อื่น ๆ
 */
export async function editProfile(userId: number, data: EditAccountDto) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false,
      deleteAt: null,
    },
  });

  if (!user) throw new Error("ไม่พบสมาชิก");

  /*
   * คำอธิบาย : เตรียมข้อมูลสำหรับอัปเดต
   *   - ใช้รูปแบบ spread เงื่อนไข (&&) เพื่ออัปเดตเฉพาะฟิลด์ที่ถูกส่งมาใน data
   *   - ป้องกันไม่ให้เขียนทับค่าด้วย undefined โดยไม่ตั้งใจ
   */
  const updateData: any = {
    ...(data.fname && { fname: data.fname }),
    ...(data.lname && { lname: data.lname }),
    ...(data.username && { username: data.username }),
    ...(data.email && { email: data.email }),
    ...(data.phone && { phone: data.phone }),
    ...(data.profileImage && { profileImage: data.profileImage }),
    ...(data.gender && { gender: data.gender as any }),
    ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
    ...(data.province && { province: data.province }),
    ...(data.district && { district: data.district }),
    ...(data.subDistrict && { subDistrict: data.subDistrict }),
    ...(data.postalCode && { postalCode: data.postalCode }),
  };

    try {
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  } catch (error: any) {
    /*
     * คำอธิบาย : จัดการกรณีเกิด Prisma Unique Constraint Error (รหัส P2002)
     *   - ตรวจสอบ target ว่าฟิลด์ไหนซ้ำ แล้วแปลงเป็นข้อความภาษาไทยที่ผู้ใช้เข้าใจง่าย
     */
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target as string[] | undefined;

      if (target?.includes("us_username")) {
        throw new Error("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
      }

      if (target?.includes("us_email")) {
        throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
      }

      if (target?.includes("us_phone")) {
        throw new Error("หมายเลขโทรศัพท์นี้ถูกใช้งานแล้ว");
      }

      throw new Error("ข้อมูลซ้ำในระบบ");
    }

    throw error;
  }
}