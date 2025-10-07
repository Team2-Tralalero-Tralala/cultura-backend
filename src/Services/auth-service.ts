/*
 * คำอธิบาย : Service สำหรับจัดการ Authentication ของผู้ใช้
 * ประกอบด้วยการสมัครสมาชิก (signup) และเข้าสู่ระบบ (login)
 * โดยเชื่อมต่อกับฐานข้อมูลผ่าน Prisma, เข้ารหัสรหัสผ่านด้วย bcrypt,
 * และสร้าง token ด้วย JWT
 */
import bcrypt from "bcrypt";
import prisma from "./database-service.js";
import { IsEmail, IsString } from "class-validator";
import { UserStatus } from "@prisma/client";
import { generateToken } from "~/Libs/token.js";

/*
 * ฟังก์ชัน : findRoleIdByName
 * คำอธิบาย : ค้นหา roleId จากชื่อ role ที่กำหนด
 * Input : name (string) - ชื่อ role เช่น "admin", "tourist"
 * Output : roleId (number) - รหัส role จากฐานข้อมูล
 * Error : throw error ถ้าไม่พบ role
 */
async function findRoleIdByName(name: string) {
  const role = await prisma.role.findUnique({ where: { name } });
  if (!role) throw new Error("Role not found");
  return role.id;
}

/*
 * DTO : signupDto
 * คำอธิบาย : โครงสร้างข้อมูลที่ใช้สมัครสมาชิก
 * Property:
 *   - username (string) : ชื่อผู้ใช้
 *   - password (string) : รหัสผ่าน (plaintext)
 *   - email (string) : อีเมล (ต้องเป็นรูปแบบ email)
 *   - fname (string) : ชื่อจริง
 *   - lname (string) : นามสกุล
 *   - phone (string) : เบอร์โทรศัพท์
 *   - role (string) : บทบาทผู้ใช้ เช่น "admin", "tourist"
 */
export class signupDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  fname: string;
  @IsString()
  lname: string;
  @IsString()
  phone: string;
  @IsString()
  role: string;
}

/*
 * ฟังก์ชัน : signup
 * คำอธิบาย : สมัครสมาชิกผู้ใช้ใหม่
 * Input : data (signupDto) - ข้อมูลผู้ใช้จาก client
 * Output : user object (ไม่รวม password) ที่ถูกบันทึกในฐานข้อมูล
 * Error :
 *   - ถ้า username/email/phone ถูกใช้แล้ว
 *   - ถ้า role ไม่พบในฐานข้อมูล
 */
export async function signup(data: signupDto) {
  const account = await prisma.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { email: data.email },
        { phone: data.phone },
      ],
    },
  });

  if (account) throw new Error("ชื่อผู้ใช้, อีเมล หรือเบอร์โทรศัพท์ถูกใช้แล้ว");

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
      roleId,
    },
    include: { role: true },
  });
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
/*
 * DTO : loginDto
 * คำอธิบาย : โครงสร้างข้อมูลที่ใช้เข้าสู่ระบบ
 * Property:
 *   - username (string) : ชื่อผู้ใช้หรืออีเมล
 *   - password (string) : รหัสผ่าน
 */
export class loginDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}
/*
 * ฟังก์ชัน : login
 * คำอธิบาย : เข้าสู่ระบบด้วย username/email และ password
 * Input : data (loginDto) - ข้อมูลการเข้าสู่ระบบ
 * Output :
 *   - user (object) : ข้อมูลผู้ใช้ที่เข้าสู่ระบบ (id, username, role)
 *   - token (string) : JWT token สำหรับยืนยันตัวตน
 * Error :
 *   - ถ้าไม่พบผู้ใช้
 *   - ถ้าผู้ใช้ถูก block
 *   - ถ้ารหัสผ่านไม่ถูกต้อง
 */
export async function login(data: loginDto) {
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

  const token = generateToken(payload);

  return { user: payload, token };
}
