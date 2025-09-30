// src/Services/account-service.ts
import prisma from "./database-service.js";
import { UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

/* ---------- Types (เฉพาะที่ใช้บนฟอร์ม) ---------- */
export type CreateUserInput = {
  roleId: number;            
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  memberOfCommunity?: number; 
};

export type EditUserInput = Partial<{
  roleId: number;
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  password: string;          
  memberOfCommunity: number;
}>;

const trimOrEmpty = (v?: unknown) => (v == null ? "" : String(v).trim());

/* ===================== Create ===================== */
export async function createAccount(input: CreateUserInput) {
  // 1) role ต้องมี
  const role = await prisma.role.findUnique({
    where: { id: input.roleId },
    select: { id: true },
  });
  if (!role) {
    const err: any = new Error("role_not_found");
    err.status = 400;
    throw err;
  }

  // 2) กันซ้ำ email/username/phone
  const email = trimOrEmpty(input.email);
  const username = trimOrEmpty(input.username);
  const phone = trimOrEmpty(input.phone);

  const [emailDup, usernameDup, phoneDup] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
    prisma.user.findUnique({ where: { phone }, select: { id: true } }),
  ]);

  const dupFields: string[] = [];
  if (emailDup) dupFields.push("email");
  if (usernameDup) dupFields.push("username");
  if (phoneDup) dupFields.push("phone");
  if (dupFields.length) {
    const err: any = new Error("duplicate");
    err.status = 409;
    err.fields = dupFields;
    throw err;
  }

  // 3) แฮชรหัสผ่าน
  const hashed = await bcrypt.hash(input.password, 10);

  // 4) สร้าง
  const user = await prisma.user.create({
    data: {
      roleId: input.roleId,
      username,
      email,
      password: hashed,

      fname: trimOrEmpty(input.fname),
      lname: trimOrEmpty(input.lname),
      phone,

      memberOfCommunity: input.memberOfCommunity ?? null,
      gender: null,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      roleId: true,
      username: true,
      email: true,
      fname: true,
      lname: true,
      phone: true,
      memberOfCommunity: true,
      status: true,
    },
  });

  return user;
}

/* ===================== Edit ===================== */
export async function editAccount(id: number, input: EditUserInput) {
  const data: Record<string, unknown> = {};

  // เปลี่ยน username → เช็กไม่ซ้ำ
  if (input.username !== undefined) {
    const newUsername = trimOrEmpty(input.username);
    const dup = await prisma.user.findFirst({
      where: { username: newUsername, NOT: { id } },
      select: { id: true },
    });
    if (dup) {
      const err: any = new Error("duplicate");
      err.status = 409;
      err.fields = ["username"];
      throw err;
    }
    data.username = newUsername;
  }

  // เปลี่ยน email → เช็กไม่ซ้ำ
  if (input.email !== undefined) {
    const newEmail = trimOrEmpty(input.email);
    const dup = await prisma.user.findFirst({
      where: { email: newEmail, NOT: { id } },
      select: { id: true },
    });
    if (dup) {
      const err: any = new Error("duplicate");
      err.status = 409;
      err.fields = ["email"];
      throw err;
    }
    data.email = newEmail;
  }

  // เปลี่ยน phone → เช็กไม่ซ้ำ
  if (input.phone !== undefined) {
    const newPhone = trimOrEmpty(input.phone);
    const dup = await prisma.user.findFirst({
      where: { phone: newPhone, NOT: { id } },
      select: { id: true },
    });
    if (dup) {
      const err: any = new Error("duplicate");
      err.status = 409;
      err.fields = ["phone"];
      throw err;
    }
    data.phone = newPhone;
  }

  // เปลี่ยน password → hash ก่อน
  if (input.password !== undefined) {
    data.password = await bcrypt.hash(String(input.password), 10);
  }

  if (input.roleId !== undefined) data.roleId = input.roleId;
  if (input.fname !== undefined) data.fname = trimOrEmpty(input.fname);
  if (input.lname !== undefined) data.lname = trimOrEmpty(input.lname);
  if (input.memberOfCommunity !== undefined) data.memberOfCommunity = input.memberOfCommunity;

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        roleId: true,
        username: true,
        email: true,
        fname: true,
        lname: true,
        phone: true,
        memberOfCommunity: true,
        status: true,
      },
    });
    return user;
  } catch (e: any) {
    if (e?.code === "P2025") {
      const nf: any = new Error("user_not_found");
      nf.status = 404;
      throw nf;
    }
    if (e?.code === "P2002") {
      const err: any = new Error("duplicate");
      err.status = 409;
      err.fields = Array.isArray(e?.meta?.target)
        ? e.meta.target
        : [String(e?.meta?.target || "unique")];
      throw err;
    }
    throw e;
  }
}
