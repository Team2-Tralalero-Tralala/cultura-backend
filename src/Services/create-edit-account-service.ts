import prisma from "./database-service.js";
import { UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

/* ---------- Types ---------- */
export type CreateUserInput = {
  roleId: number;
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  password: string;

  // ถ้า field เหล่านี้เป็น NOT NULL ที่ฝั่ง DB ให้ใส่ค่าว่างถ้าไม่ได้ส่งมา
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  activityRole?: string;
};

export type EditUserInput = Partial<{
  roleId: number;
  fname: string;
  lname: string;
  phone: string;

  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  activityRole: string;
}>;

const toEmpty = (v?: unknown) => (v == null ? "" : String(v).trim());

/* ---------- Create ---------- */
export async function createAccount(input: CreateUserInput) {
  // role ต้องมี
  const role = await prisma.role.findUnique({
    where: { id: input.roleId },
    select: { id: true },
  });
  if (!role) {
    const err: any = new Error("role_not_found");
    err.status = 400;
    throw err;
  }

  // กัน email/username ซ้ำ (อ่านง่ายกว่าปล่อย P2002)
  const dupEmail = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (dupEmail) {
    const err: any = new Error("email_duplicate");
    err.status = 409;
    throw err;
  }
  const dupUsername = await prisma.user.findUnique({
    where: { username: input.username },
    select: { id: true },
  });
  if (dupUsername) {
    const err: any = new Error("username_duplicate");
    err.status = 409;
    throw err;
  }

  // แฮชรหัสผ่าน
  const hashed = await bcrypt.hash(input.password, 10);

  // บันทึก
  const user = await prisma.user.create({
    data: {
      roleId: input.roleId,
      username: input.username,
      email: input.email,
      password: hashed,

      fname: input.fname,
      lname: input.lname,
      phone: input.phone,

      subDistrict: toEmpty(input.subDistrict),
      district: toEmpty(input.district),
      province: toEmpty(input.province),
      postalCode: toEmpty(input.postalCode),
      activityRole: toEmpty(input.activityRole),

      gender: null,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      roleId: true,
      email: true,
      username: true,
      status: true,
      fname: true,
      lname: true,
      phone: true,
    },
  });

  return user;
}

/* ---------- Edit ---------- */
export async function editAccount(id: number, input: EditUserInput) {
  const data: any = {};

  if (input.roleId !== undefined) data.roleId = input.roleId;
  if (input.fname !== undefined) data.fname = input.fname;
  if (input.lname !== undefined) data.lname = input.lname;
  if (input.phone !== undefined) data.phone = input.phone;

  if (input.subDistrict !== undefined)
    data.subDistrict = toEmpty(input.subDistrict);
  if (input.district !== undefined) data.district = toEmpty(input.district);
  if (input.province !== undefined) data.province = toEmpty(input.province);
  if (input.postalCode !== undefined)
    data.postalCode = toEmpty(input.postalCode);
  if (input.activityRole !== undefined)
    data.activityRole = toEmpty(input.activityRole);

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        roleId: true,
        email: true,
        username: true,
        status: true,
        fname: true,
        lname: true,
        phone: true,
      },
    });
    return user;
  } catch (e: any) {
    if (e?.code === "P2025") {
      const err: any = new Error("user_not_found");
      err.status = 404;
      throw err;
    }
    if (e?.code === "P2002") throw e;
    throw e;
  }
}
