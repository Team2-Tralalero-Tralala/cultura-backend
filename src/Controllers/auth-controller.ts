/*
 * คำอธิบาย : Controller สำหรับการจัดการ Authentication
 * ประกอบด้วยการสมัครสมาชิก (signup), เข้าสู่ระบบ (login), และออกจากระบบ (logout)
 * โดยใช้ AuthService ในการทำงานหลัก และส่งผลลัพธ์กลับด้วย createResponse / createErrorResponse
 */
import * as AuthService from "~/Services/authentication/auth-service.js";

import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { verifyToken } from "~/Libs/token.js";
import { ForgetPasswordDto, LoginDto, SetPasswordDto, SignupDto } from "~/Services/authentication/auth-dto.js";

export const JWT_EXPIRATION_SECONDS = 24 * 60 * 60;

/*
 * DTO : signupDto
 * วัตถุประสงค์ : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint /signup
 * Input : body (SignupDto) - ข้อมูลผู้ใช้ เช่น username, password, email
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const signupDto = {
  body: SignupDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับสมัครสมาชิกผู้ใช้ใหม่
 * Input : req.body - ข้อมูลผู้ใช้จาก client (ผ่านการ validate ด้วย signupDto แล้ว)
 * Output :
 *   - 201 Created พร้อมข้อมูลผู้ใช้ที่สร้างใหม่
 *   - 400 Bad Request ถ้ามี error
 */
export const signup: TypedHandlerFromDto<typeof signupDto> = async (
  req,
  res
) => {
  try {
    const result = await AuthService.signup(req.body);
    return createResponse(res, 201, "User created successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
/*
 * DTO : loginDto
 * วัตถุประสงค์ : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint /login
 * Input : body (LoginDto) - ข้อมูลผู้ใช้ เช่น username, password
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const loginDto = {
  body: LoginDto,
} satisfies commonDto;
/*
 * คำอธิบาย : Handler สำหรับเข้าสู่ระบบ
 * Input : req.body - ข้อมูลผู้ใช้จาก client (ผ่านการ validate ด้วย loginDto แล้ว)
 * Output :
 *   - 201 Created พร้อมข้อมูล token และ user
 *   - ตั้งค่า cookie "accessToken" สำหรับ session ของผู้ใช้ (อายุ 1 ชั่วโมง)
 *   - 400 Bad Request ถ้าเข้าสู่ระบบไม่สำเร็จ
 */
export const login: TypedHandlerFromDto<typeof loginDto> = async (req, res) => {
  try {
    const result = await AuthService.login(
      req.body,
      req.ip ?? "",
      JWT_EXPIRATION_SECONDS
    );
    res.cookie("accessToken", result.token, {
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // อายุ 24 ชั่วโมง
    });
    return createResponse(res, 201, "Login successful", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
/*
 * คำอธิบาย : Handler สำหรับออกจากระบบ
 * Input : -
 * Output :
 *   - เคลียร์ cookie "accessToken"
 *   - 201 Created เมื่อออกจากระบบสำเร็จ
 *   - 400 Bad Request ถ้ามี error
 */
export const logout: TypedHandlerFromDto<typeof loginDto> = async (
  req,
  res
) => {
  try {
    res.clearCookie("accessToken");
    await AuthService.logout(req.user, req.ip ?? "");
    return createResponse(res, 201, "logout successful");
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
/*
 * DTO : checkLoginDto
 * วัตถุประสงค์ : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint /login
 * Input : body (AuthService.checkLoginDto) - ข้อมูลผู้ใช้ เช่น username, password
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const checkLoginDto = {} satisfies commonDto;

/*
 * คำอธิบาย : Handler เช็คว่ายังเข้าสู่ระบบอยู่มั้ย
 * Input : -
 * Output :
 *   - เช็ค cookie "accessToken"
 *   - 200 Created เมื่อมีเข้าสู่ระบบอยู่
 *   - 400 Bad Request ถ้ามี error
 */
export const me: TypedHandlerFromDto<typeof checkLoginDto> = async (
  req,
  res
) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = await verifyToken(token);
    const user = await AuthService.getProfile(decoded.id);
    return createResponse(res, 200, "check successful", user);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * DTO : forgetPasswordDto
 * วัตถุประสงค์ : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint /forget-password
 * Input : body (ForgetPasswordDto) - ข้อมูลผู้ใช้ เช่น email
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const forgetPasswordDto = {
  body: ForgetPasswordDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับลืมรหัสผ่าน
 * Input : req.body - ข้อมูลผู้ใช้จาก client (ผ่านการ validate ด้วย forgetPasswordDto แล้ว)
 * Output :
 *   - 200 Created พร้อมข้อมูลที่สร้างใหม่
 *   - 400 Bad Request ถ้ามี error
 */
export const forgetPassword: TypedHandlerFromDto<typeof forgetPasswordDto> = async (
  req,
  res
) => {
  try {
    const result = await AuthService.forgetPassword(req.body);
    return createResponse(res, 200, "forget password successful", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/*
 * DTO : setPasswordDto
 * วัตถุประสงค์ : กำหนด schema สำหรับข้อมูลที่รับเข้ามาใน endpoint /set-password
 * Input : body (SetPasswordDto) - ข้อมูลผู้ใช้ เช่น password
 * Output : ตรวจสอบความถูกต้องของข้อมูลก่อนเข้าสู่ handler
 */
export const setPasswordDto = {
  body: SetPasswordDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Handler สำหรับตั้งรหัสผ่าน
 * Input : req.body - ข้อมูลผู้ใช้จาก client (ผ่านการ validate ด้วย setPasswordDto แล้ว)
 * Output :
 *   - 200 Created พร้อมข้อมูลที่สร้างใหม่
 *   - 400 Bad Request ถ้ามี error
 */
export const setPassword: TypedHandlerFromDto<typeof setPasswordDto> = async (
  req,
  res
) => {
  try {
    const result = await AuthService.setPassword(req.body);
    return createResponse(res, 200, "set password successful", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};