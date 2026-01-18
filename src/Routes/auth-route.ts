import { Router } from "express";
import {
  signup,
  login,
  signupDto,
  loginDto,
  logout,
  me,
  checkLoginDto,
  forgetPassword,
  forgetPasswordDto,
  setPassword,
  setPasswordDto,
} from "../Controllers/auth-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";

const authRoutes = Router();
/**
 * คำอธิบาย : เส้นทางสำหรับการลงทะเบียนผู้ใช้ใหม่
 */
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: สมัครสมาชิกใหม่ (User Signup)
 *     description: สร้างบัญชีผู้ใช้งานใหม่ในระบบ โดยต้องกรอกข้อมูลให้ครบถ้วนตามที่กำหนด
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - fname
 *               - lname
 *               - phone
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *                 description: ชื่อผู้ใช้งาน (username)
 *               password:
 *                 type: string
 *                 example: Passw0rd!
 *                 description: รหัสผ่านที่ต้องการตั้ง
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *                 description: อีเมลสำหรับติดต่อ
 *               fname:
 *                 type: string
 *                 example: John
 *                 description: ชื่อจริงของผู้ใช้งาน
 *               lname:
 *                 type: string
 *                 example: Doe
 *                 description: นามสกุลของผู้ใช้งาน
 *               phone:
 *                 type: string
 *                 example: "0812345678"
 *                 description: เบอร์โทรศัพท์ติดต่อ
 *               role:
 *                 type: string
 *                 enum: [super, admin, member, tourist]
 *                 example: member
 *                 description: บทบาทผู้ใช้งานในระบบ
 *     responses:
 *       201:
 *         description: สมัครสมาชิกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: สมัครสมาชิกสำเร็จ
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     role:
 *                       type: string
 *                       example: member
 *       400:
 *         description: ข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: ข้อมูลไม่ถูกต้อง กรุณากรอกข้อมูลใหม่
 *       409:
 *         description: ผู้ใช้งานนี้มีอยู่ในระบบแล้ว
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: มีชื่อผู้ใช้งานหรืออีเมลนี้อยู่ในระบบแล้ว
 */
authRoutes.post("/signup", await validateDto(signupDto), signup);
/**
 * คำอธิบาย : เส้นทางสำหรับการเข้าสู่ระบบผู้ใช้
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: เข้าสู่ระบบ (User Login)
 *     description: ใช้สำหรับเข้าสู่ระบบด้วยชื่อผู้ใช้งานและรหัสผ่านที่ได้สมัครไว้
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *                 description: ชื่อผู้ใช้งาน (username)
 *               password:
 *                 type: string
 *                 example: Passw0rd!
 *                 description: รหัสผ่านของผู้ใช้งาน
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: เข้าสู่ระบบสำเร็จ
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     role:
 *                       type: string
 *                       example: member
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                       description: JSON Web Token (JWT) สำหรับยืนยันตัวตน
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน
 *       401:
 *         description: เข้าสู่ระบบไม่สำเร็จ (ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */
authRoutes.post("/login", await validateDto(loginDto), login);

/**
 * คำอธิบาย : เส้นทางสำหรับการออกจากระบบผู้ใช้
 */
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: ออกจากระบบ (User Logout)
 *     description: ใช้สำหรับออกจากระบบ โดยต้องแนบ JWT token ที่ได้รับจากการเข้าสู่ระบบ
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ออกจากระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: ออกจากระบบสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้องหรือหมดอายุ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Missing Token
 */
authRoutes.post("/logout", authMiddleware, logout);
/**
 * คำอธิบาย : เส้นทางสำหรับตรวจสอบสถานะการล็อกอินของผู้ใช้
 */
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: ตรวจสอบข้อมูลผู้ใช้ปัจจุบัน (Check Login Info)
 *     description: ดึงข้อมูลผู้ใช้งานปัจจุบันจาก JWT Token ที่แนบมา เพื่อเช็คสถานะการเข้าสู่ระบบ
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token ที่ได้จากการเข้าสู่ระบบ
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: แสดงข้อมูลผู้ใช้งานปัจจุบัน
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: ดึงข้อมูลผู้ใช้งานสำเร็จ
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     fname:
 *                       type: string
 *                       example: John
 *                     lname:
 *                       type: string
 *                       example: Doe
 *                     phone:
 *                       type: string
 *                       example: "0812345678"
 *                     role:
 *                       type: string
 *                       example: member
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-10T08:00:00.000Z
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้องหรือหมดอายุ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Token ไม่ถูกต้องหรือหมดอายุ
 */
authRoutes.get("/me", authMiddleware, validateDto(checkLoginDto), me);

/**
 * คำอธิบาย : ลืมรหัสผ่าน (ส่ง อีเมล/โทรศัพท์ + วันเกิด(พ.ศ) เพื่อรับ changePasswordCode)
 */
authRoutes.post(
  "/forget-password",
  await validateDto(forgetPasswordDto),
  forgetPassword
);

/**
 * คำอธิบาย : ตั้งรหัสผ่านใหม่ (ส่ง รหัสใหม่ + changePasswordCode)
 */
authRoutes.post("/set-password", await validateDto(setPasswordDto), setPassword);

export default authRoutes;
