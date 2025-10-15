/*
 * Service: Account (สร้าง/แก้ไข)
 * - ตรวจเงื่อนไขทั้งหมดใน service (controller ไม่ if/else)
 * - โยน Error(message) ให้ controller แปลงเป็น response ตาม standard
 * - ไม่จับ Prisma รายกรณีที่นี่ (ให้ middleware/global handler ของโปรเจ็กต์ทำ)
 */
import prisma from "./database-service.js";
import bcrypt from "bcryptjs";
import type { CreateAccountDto, EditAccountDto } from "./account-dto.js";
import type { PaginationResponse } from "./pagination-dto.js";


/**
 * ชุดฟิลด์ที่ “ปลอดภัย” สำหรับ select กลับไปให้ client
 * - ป้องกันการคืน password และฟิลด์ภายในอื่น ๆ โดยไม่ตั้งใจ
 * - ใช้ซ้ำได้ทั้ง create และ edit
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
} as const;

/**
 * สร้างผู้ใช้ใหม่
 * ขั้นตอน:
 * 1) ตรวจว่า role ที่อ้างอิงมีจริง (กัน foreign key ผิด)
 * 2) กันข้อมูลซ้ำ (username/email/phone) เพื่อหลบ P2002 เบื้องต้น
 * 3) hash password ก่อนบันทึก
 * 4) คืนเฉพาะฟิลด์ที่ปลอดภัย (selectSafe)
 * หมายเหตุ:
 * - ถ้า race condition เกิดพร้อมกันหลายคำขอ อาจยังโดน P2002 ได้
 *   ให้ global error handler ของโปรเจกต์ map -> 409 duplicate ตามมาตรฐานต่อไป
 */
/**
 * สร้างผู้ใช้ใหม่
 * ขั้นตอน:
 * 1) ตรวจว่า role ที่อ้างอิงมีจริง (กัน foreign key ผิด)
 * 2) จำกัดให้ superadmin สร้างได้เฉพาะ role "admin" (ชั่วคราว)
 * 3) กันข้อมูลซ้ำ (username/email/phone) เพื่อหลบ P2002 เบื้องต้น
 * 4) hash password ก่อนบันทึก
 * 5) คืนเฉพาะฟิลด์ที่ปลอดภัย (selectSafe)
 * หมายเหตุ:
 * - ภายหลังสามารถขยาย allowedRoles ได้ เช่น ["admin", "member", "tourist"]
 */
export async function createAccount(body: CreateAccountDto) {
  // 1) ตรวจว่า role ที่อ้างอิงมีจริง
  const role = await prisma.role.findUnique({
    where: { id: body.roleId },
    select: { id: true, name: true },
  });
  if (!role) throw new Error("role_not_found");

  // 2) จำกัดเฉพาะ role ที่อนุญาตให้สร้างได้ (ตอนนี้คือ admin)
  const allowedRoles = ["admin", "member", "tourist"]; 
  if (!allowedRoles.includes(role.name)) {
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
    ...(body.memberOfCommunity && { memberOfCommunity: body.memberOfCommunity }),
    ...(body.gender && { gender: body.gender as any }), // Prisma enum Gender
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
/**
 * แก้ไขข้อมูลผู้ใช้
 * ขั้นตอน:
 * 1) ตรวจความถูกต้องของ userId (เป็นจำนวนเต็มบวก)
 * 2) ตรวจว่าผู้ใช้มีอยู่จริง
 * 3) หากมีการส่ง username/email/phone มา ให้เช็คซ้ำเฉพาะฟิลด์ที่ส่งมา (exclude ตัวเองด้วย id != userId)
 * 4) ประกอบ data แบบ partial เฉพาะฟิลด์ที่ส่งมาเท่านั้น (จะไม่ทับค่าที่ไม่ได้ส่ง)
 * 5) ถ้าส่ง password มา ให้ hash ก่อน
 * 6) update แล้วคืนเฉพาะฟิลด์ที่ปลอดภัย
 * หมายเหตุ:
 * - โยน Error เป็นข้อความสั้นๆ ให้ controller ไป map เป็น status/message ตาม response standard
 */
export async function editAccount(userId: number, body: EditAccountDto) {
  // 1) ตรวจ id
  if (!Number.isFinite(userId) || userId <= 0)
    throw new Error("invalid_user_id");

  // 2) มี user นี้จริงไหม
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

    //  เพิ่มฟิลด์สำหรับ Tourist / Member
    ...(body.memberOfCommunity !== undefined && {
      memberOfCommunity: body.memberOfCommunity,
    }),
    ...(body.gender && { gender: body.gender as any }),
    ...(body.birthDate && { birthDate: new Date(body.birthDate) }),
    ...(body.province && { province: body.province }),
    ...(body.district && { district: body.district }),
    ...(body.subDistrict && { subDistrict: body.subDistrict }),
    ...(body.postalCode && { postalCode: body.postalCode }),
  };

  // 5) หากส่ง password มา ให้ hash ก่อนเก็บ
  if (body.password !== undefined && body.password.trim() !== "") {
    data.password = await bcrypt.hash(body.password, 10);
  }

  // 6) อัปเดตและคืนเฉพาะฟิลด์ที่ปลอดภัย
  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
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
      memberOfCommunity: true,
    },
  });

  return updated;
}

/**
 * ดึงข้อมูลผู้ใช้ตาม id (ใช้ในหน้าแก้ไขบัญชี)
 */
export async function getAccountById(userId: number) {
  if (!Number.isFinite(userId) || userId <= 0)
    throw new Error("invalid_user_id");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
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
      memberOfCommunity: true,
      role: { select: { name: true } },
    },
  });

  if (!user) throw new Error("user_not_found");
  return user;
}
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

/**
 * ดึงสมาชิกของ community ตาม adminId
 * ใช้สำหรับ role: admin
 */
export const getMemberByAdmin = async (adminId: number) => {
  const members = await prisma.user.findMany({
    where: { memberOfCommunity: adminId },
    select: {
      id: true,
      fname: true,
      lname: true,
      email: true,
      phone: true,
      profileImage: true,
    },
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

/**
 * ดึงข้อมูลผู้ใช้ตาม id
 * ใช้สำหรับหน้าแก้ไขบัญชี
 */
