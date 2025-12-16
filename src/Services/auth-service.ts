/*
 * คำอธิบาย : Service สำหรับจัดการ Authentication ของผู้ใช้
 * ประกอบด้วยการสมัครสมาชิก (signup) และเข้าสู่ระบบ (login)
 * โดยเชื่อมต่อกับฐานข้อมูลผ่าน Prisma, เข้ารหัสรหัสผ่านด้วย bcrypt,
 * และสร้าง token ด้วย JWT
 */
import { Gender, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { generateToken } from "~/Libs/token.js";
import type { UserPayload } from "~/Libs/Types/index.js";
import prisma from "./database-service.js";

// JWT token expiration time (should match the value in token.ts)
const JWT_EXPIRATION_HOURS = 1;

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
  expirationSeconds: number
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
        log.loginTime!.getTime() + expirationSeconds * 1000
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
 * DTO : signupDto
 * คำอธิบาย : โครงสร้างข้อมูลที่ใช้สมัครสมาชิก
 * input: username, password, email, fname, lname, phone, role, gender, birthDate, province, district, subDistrict, postalCode
 * output: User
 */
export class SignupDto {
  @IsString()
  @IsNotEmpty({ message: "ชื่อผู้ใช้ห้ามว่าง" })
  username: string;

  @IsString()
  @IsNotEmpty({ message: "รหัสผ่านห้ามว่าง" })
  password: string;

  @IsString()
  @IsEmail({}, { message: "รูปแบบอีเมลไม่ถูกต้อง" })
  @IsNotEmpty({ message: "อีเมลห้ามว่าง" })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "ชื่อจริงห้ามว่าง" })
  fname: string;

  @IsString()
  @IsNotEmpty({ message: "นามสกุลห้ามว่าง" })
  lname: string;

  @IsString()
  @IsNotEmpty({ message: "เบอร์โทรศัพท์ห้ามว่าง" })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: "บทบาทห้ามว่าง" })
  role: string;

  @IsEnum(Gender, { message: "เพศไม่ถูกต้อง" })
  gender: Gender;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: "วันเกิดห้ามว่าง" })
  birthDate: Date;

  @IsString()
  @IsNotEmpty({ message: "จังหวัดห้ามว่าง" })
  province: string;

  @IsString()
  @IsNotEmpty({ message: "อำเภอ/เขตห้ามว่าง" })
  district: string;

  @IsString()
  @IsNotEmpty({ message: "ตำบล/แขวงห้ามว่าง" })
  subDistrict: string;

  @IsString()
  @IsNotEmpty({ message: "รหัสไปรษณีย์ห้ามว่าง" })
  postalCode: string;
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
/*
 * DTO : loginDto
 * คำอธิบาย : โครงสร้างข้อมูลที่ใช้เข้าสู่ระบบ
 * input: username, password
 * output: User
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: "ชื่อผู้ใช้หรืออีเมลห้ามว่าง" })
  username: string;

  @IsString()
  @IsNotEmpty({ message: "รหัสผ่านห้ามว่าง" })
  password: string;
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
  expirationSeconds: number
) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.username }],
    },
    include: { role: true },
  });
  if (!user) throw new Error("ไม่พบผู้ใช้งาน");

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
 * Error : throw error ถ้าไม่พบผู้ใช้s
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
  };
}
