/*
 * คำอธิบาย : Service สำหรับจัดการ Authentication ของผู้ใช้
 * ประกอบด้วยการสมัครสมาชิก (signup) และเข้าสู่ระบบ (login)
 * โดยเชื่อมต่อกับฐานข้อมูลผ่าน Prisma, เข้ารหัสรหัสผ่านด้วย bcrypt,
 * และสร้าง token ด้วย JWT
 */
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateToken } from "~/Libs/token.js";
import type { UserPayload } from "~/Libs/Types/index.js";
import prisma from "../database-service.js";
import type {
  ForgetPasswordDto,
  LoginDto,
  SetPasswordDto,
  SignupDto,
} from "./auth-dto.js";
import { UserStatus } from "@prisma/client";

/*
 * คำอธิบาย : ค้นหา roleId จากชื่อ role ที่กำหนด
 * Input : name (string) - ชื่อ role เช่น "admin", "tourist"
 * Output : roleId (number) - รหัส role จากฐานข้อมูล
 */
async function findRoleIdByName(name: string) {
  const role = await prisma.role.findUnique({ where: { name } });
  if (!role) throw new Error("Role not found");
  return role.id;
}

/*
 * คำอธิบาย : จัดการ session ที่หมดอายุโดยอัพเดต logoutTime
 * Input : userId (number) - รหัสผู้ใช้
 * Output : จำนวน session ที่หมดอายุ
 */
async function handleExpiredSessions(
  userId: number,
  expirationSeconds: number,
) {
  const expirationTimeAgo = new Date(Date.now() - expirationSeconds * 1000);

  const expiredLogs = await prisma.log.findMany({
    where: {
      userId: userId,
      logoutTime: null,
      loginTime: {
        lt: expirationTimeAgo,
      },
    },
  });

  if (expiredLogs.length > 0) {
    // อัพเดตแต่ละ log โดยตั้งค่า logoutTime เป็นเวลาที่ session หมดอายุจริง
    for (const log of expiredLogs) {
      const expirationTime = new Date(
        log.loginTime!.getTime() + expirationSeconds * 1000,
      );
      await prisma.log.update({
        where: { id: log.id },
        data: {
          logoutTime: expirationTime,
        },
      });
    }
  }

  return expiredLogs.length;
}

/*
 * คำอธิบาย : สมัครสมาชิกผู้ใช้ใหม่
 * Input : data (signupDto) - ข้อมูลผู้ใช้จาก client
 * Output : user object (ไม่รวม password) ที่ถูกบันทึกในฐานข้อมูล
 */
export async function signup(data: SignupDto) {
  const account = await prisma.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { email: data.email },
        { phone: data.phone },
      ],
    },
  });

  if (account) {
    if (account.username === data.username)
      throw new Error("ชื่อผู้ใช้ถูกใช้แล้ว");
    if (account.email === data.email) throw new Error("อีเมลถูกใช้แล้ว");
    if (account.phone === data.phone)
      throw new Error("เบอร์โทรศัพท์ถูกใช้แล้ว");
    throw new Error("ชื่อผู้ใช้, อีเมล หรือเบอร์โทรศัพท์ถูกใช้แล้ว");
  }

  const [roleId, hashedPassword] = await Promise.all([
    findRoleIdByName(data.role),
    bcrypt.hash(data.password, 10),
  ]);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      fname: data.fname,
      lname: data.lname,
      phone: data.phone,
      birthDate: data.birthDate,
      roleId,
      gender: data.gender,
      province: data.province,
      district: data.district,
      subDistrict: data.subDistrict,
      postalCode: data.postalCode,
    },
    include: { role: true },
  });
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function parseBirthDateBE(birthDateBE: string) {
  const matchParts = birthDateBE.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!matchParts) throw new Error("รูปแบบวันเกิดไม่ถูกต้อง");

  const day = Number(matchParts[1]);
  const monthIndex = Number(matchParts[2]) - 1; // 0-based
  const buddhistYear = Number(matchParts[3]);
  const gregorianYear = buddhistYear - 543;

  const dateCandidate = new Date(gregorianYear, monthIndex, day);
  const isSame =
    dateCandidate.getFullYear() === gregorianYear &&
    dateCandidate.getMonth() === monthIndex &&
    dateCandidate.getDate() === day;

  if (!isSame) throw new Error("วันเกิดไม่ถูกต้อง");
  return dateCandidate;
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/*
 * คำอธิบาย : สร้าง changePasswordCode สำหรับรีเซ็ตรหัสผ่าน (ยืนยันตัวตนด้วย email/phone + วันเกิด)
 * Input : payload (ForgetPasswordDto) - contact และ birthDateBE
 * Output : { changePasswordCode, expiresAt } - โค้ดสำหรับเปลี่ยนรหัสผ่านและเวลาหมดอายุ
 */
export async function forgetPassword(payload: ForgetPasswordDto) {
  const contact = payload.contact.trim().toLowerCase();
  const isEmail = contact.includes("@");

  const birthDateAD = parseBirthDateBE(payload.birthDateBE);

  const where = isEmail ? { email: contact } : { phone: contact };

  const user = await prisma.user.findFirst({
    where: { ...where, isDeleted: false },
    select: { id: true, birthDate: true },
  });

  if (!user || !user.birthDate) throw new Error("ไม่พบผู้ใช้งาน");
  if (!isSameDate(user.birthDate, birthDateAD))
    throw new Error("ข้อมูลไม่ถูกต้อง");

  const changePasswordCode =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 นาที
  const tokenHash = sha256Hex(changePasswordCode);

  // ทำให้ code เดิมของ user หมดสภาพ (กันสับสน/โค้ดค้าง)
  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
      select: { id: true },
    }),
  ]);

  return { changePasswordCode, expiresAt };
}

/*
 * คำอธิบาย : ตั้งรหัสผ่านใหม่ด้วย changePasswordCode ที่ยังไม่หมดอายุและยังไม่ถูกใช้
 * Input : payload (SetPasswordDto) - changePasswordCode และ newPassword
 * Output : { success: true } เมื่อเปลี่ยนรหัสผ่านสำเร็จ
 */
export async function setPassword(payload: SetPasswordDto) {
  const tokenHash = sha256Hex(payload.changePasswordCode.trim());
  const now = new Date();

  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, usedAt: true, expiresAt: true },
  });

  if (!token) throw new Error("changePasswordCode ไม่ถูกต้อง");
  if (token.usedAt) throw new Error("changePasswordCode นี้ถูกใช้แล้ว");
  if (token.expiresAt < now) throw new Error("changePasswordCode หมดอายุแล้ว");

  const newHash = await bcrypt.hash(payload.newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { password: newHash },
      select: { id: true },
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: now },
      select: { id: true },
    }),
  ]);

  return { success: true };
}
/*
 * คำอธิบาย : เข้าสู่ระบบด้วย username/email และ password
 * Input : data (loginDto) - ข้อมูลการเข้าสู่ระบบ
 * Output :
 *   - user (object) : ข้อมูลผู้ใช้ที่เข้าสู่ระบบ (id, username, role)
 *   - token (string) : JWT token สำหรับยืนยันตัวตน
 */
export async function login(
  data: LoginDto,
  ipAddress: string,
  expirationSeconds: number,
) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.username }],
    },
    include: { role: true },
  });
  if (!user) throw new Error("ไม่พบบัญชีผู้ใช้งาน");

  const match = await bcrypt.compare(data.password, user.password);
  if (!match) throw new Error("รหัสผ่านไม่ถูกต้อง");

  if (user.status === UserStatus.BLOCKED)
    throw new Error(`${user.role.name} ถูกบล็อก`);

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role?.name,
  };

  const token = generateToken(payload, expirationSeconds);

  // จัดการ session ที่หมดอายุก่อนสร้าง log ใหม่
  await handleExpiredSessions(user.id, expirationSeconds);

  await prisma.log.create({
    data: {
      user: {
        connect: { id: user.id },
      },
      ipAddress: ipAddress,
      loginTime: new Date(),
    },
  });
  return { user: payload, token };
}

/*
 * คำอธิบาย : ออกจากระบบผู้ใช้
 * Input : user (UserPayload | undefined) - ข้อมูลผู้ใช้ที่ต้องการออกจากระบบ, ipAddress (string) - ที่อยู่ IP ของผู้ใช้
 * Output :
 *  - อัพเดต log ของผู้ใช้โดยเพิ่มเวลาที่ออกจากระบบ
 */
export async function logout(user: UserPayload | undefined, ipAddress: string) {
  if (user) {
    // หา log ล่าสุดที่ยังไม่มี logoutTime
    const latestLog = await prisma.log.findFirst({
      where: {
        userId: user.id,
        logoutTime: null,
      },
      orderBy: {
        loginTime: "desc",
      },
    });

    if (latestLog) {
      // อัพเดต log ที่มีอยู่
      await prisma.log.update({
        where: { id: latestLog.id },
        data: {
          logoutTime: new Date(),
        },
      });
    } else {
      // ถ้าไม่พบ log ที่ยังไม่มี logoutTime ให้สร้าง log ใหม่
      await prisma.log.create({
        data: {
          user: {
            connect: { id: user.id },
          },
          ipAddress: ipAddress,
          logoutTime: new Date(),
        },
      });
    }
  }

  return;
}

/*
 * คำอธิบาย : ดึงข้อมูลโปรไฟล์ของผู้ใช้จากฐานข้อมูล
 * Input : userId (number) - รหัสผู้ใช้
 * Output : ข้อมูลผู้ใช้ (fname, lname, email, role)
 */
export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) throw new Error("User not found");

  return {
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    role: user.role.name,
    profileImage: user.profileImage,
  };
}
