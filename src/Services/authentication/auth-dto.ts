import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from "class-validator";
import { Type } from "class-transformer";
import { Gender } from "@prisma/client";

/*
 * DTO : LoginDto
 * วัตถุประสงค์ : โครงสร้างข้อมูลสำหรับเข้าสู่ระบบ
 * Input : username, password
 * Output : User
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: "ชื่อผู้ใช้หรืออีเมลห้ามว่าง" })
  username: string;

  @IsString()
  @IsNotEmpty({ message: "รหัสผ่านห้ามว่าง" })
  password: string;
}
/**
 * DTO : SignupDto
 * วัตถุประสงค์ : โครงสร้างข้อมูลสำหรับสมัครสมาชิก
 * Input : username, password, email, fname, lname, phone, role, gender, birthDate, province, district, subDistrict, postalCode
 * Output : User
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
 * DTO : ForgetPasswordDto
 * วัตถุประสงค์ : โครงสร้างข้อมูลสำหรับขอรหัสเปลี่ยนรหัสผ่าน (forget password)
 * Input : contact (email หรือ phone), birthDateBE (วันเกิดรูปแบบ dd/MM/yyyy เป็นปี พ.ศ.)
 * Output : ผ่าน/ไม่ผ่านการตรวจสอบ พร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class ForgetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์" })
  contact: string;

  // วัน-เดือน-ปีเกิด (พ.ศ) รูปแบบ dd/MM/yyyy
  @IsString()
  @Matches(/^(\d{2})\/(\d{2})\/(\d{4})$/, {
    message: "รูปแบบวันเกิดไม่ถูกต้อง (วว/ดด/ปปปป)",
  })
  @IsNotEmpty({ message: "กรุณาระบุวันเกิด" })
  birthDateBE: string;
}
/*
 * DTO : SetPasswordDto
 * วัตถุประสงค์ : โครงสร้างข้อมูลสำหรับตั้งรหัสผ่านใหม่ด้วย changePasswordCode
 * Input : changePasswordCode, newPassword
 * Output : ผ่าน/ไม่ผ่านการตรวจสอบ พร้อมข้อความผิดพลาดเมื่อไม่ถูกต้อง
 */
export class SetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: "กรุณากรอก changePasswordCode" })
  changePasswordCode: string;

  @IsString()
  @IsNotEmpty({ message: "กรุณากรอกรหัสผ่านใหม่" })
  // อย่างน้อย 8 ตัวอักษร, มี a-z, A-Z, 0-9
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/, {
    message:
      "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วย A-Z, a-z และ 0-9",
  })
  newPassword: string;
}

