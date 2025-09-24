import prisma from "./database-service.js";
import { UserStatus } from "@prisma/client";

/** ---------- Create ---------- */
export type CreateUserInput = {
  roleId: number;
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl?: string | null;
};

const toEmpty = (v?: string) => v ?? "";

/** สร้างบัญชีผู้ใช้ใหม่ */
export async function createAccount(input: CreateUserInput) {
  // 1) ตรวจ roleId
  const role = await prisma.role.findUnique({ where: { id: input.roleId } });
  if (!role) {
    const err: any = new Error("role_not_found");
    err.status = 400;
    throw err;
  }

  // 2) กันอีเมลซ้ำ
  const dup = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (dup) {
    const err: any = new Error("email_duplicate");
    err.status = 409;
    throw err;
  }

  // 3) บันทึก
  const user = await prisma.user.create({
    data: {
      roleId: input.roleId,
      username: input.username,
      email: input.email,
      password: input.password, // TODO: bcrypt.hash ภายหลัง
      fname: input.fname,
      lname: input.lname,
      phone: input.phone,

      // ฟิลด์ที่ schema ไม่อนุญาต null → ให้ค่าว่างไว้ก่อน
      subDistrict: toEmpty(),
      district: toEmpty(),
      province: toEmpty(),
      postalCode: toEmpty(),
      activityRole: toEmpty(),

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
      // avatarUrl: true,
    },
  });

  return user;
}

/** ---------- Edit ---------- */
export type EditUserInput = {
  roleId?: number;
  fname?: string;
  lname?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string; // TODO: hash ถ้าจะเปิดแก้รหัสผ่าน
  status?: UserStatus; // 'ACTIVE' | 'BLOCKED'

  
  // ข้อมูลส่วนตัว (เผื่อใช้)
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  activityRole?: string;
 

  avatarUrl?: string | null;
};

const pick = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

/** แก้ไขบัญชีผู้ใช้ */
export async function editAccount(id: number, input: EditUserInput) {
  // กันยิงว่าง ๆ
  const hasAny = Object.values(input).some((v) => v !== undefined);
  if (!hasAny) {
    const e: any = new Error("no_changes");
    e.status = 400;
    throw e;
  }

  // มีการเปลี่ยน roleId → ต้องตรวจว่า role มีจริง
  if (typeof input.roleId === "number") {
    const role = await prisma.role.findUnique({ where: { id: input.roleId } });
    if (!role) {
      const e: any = new Error("role_not_found");
      e.status = 400;
      throw e;
    }
  }

  // TODO: ถ้าเปิดแก้ password ให้ hash ที่นี่ก่อน
  // if (input.password) input.password = await bcrypt.hash(input.password, 10);

  const data = pick({
    roleId: input.roleId,
    username: input.username,
    email: input.email,
    password: input.password,
    fname: input.fname,
    lname: input.lname,
    phone: input.phone,
    status: input.status,
    // เผื่อใช้
    subDistrict: input.subDistrict,
    district: input.district,
    province: input.province,
    postalCode: input.postalCode,
    activityRole: input.activityRole,
    
  });

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
        // avatarUrl: true, // มีคอลัมน์นี้ค่อยเปิดใช้
      },
    });
    return user;
  } catch (e: any) {
    if (e?.code === "P2025") {
      const err: any = new Error("user_not_found");
      err.status = 404;
      throw err;
    }
    if (e?.code === "P2002") throw e; // unique conflict
    throw e;
  }
}
