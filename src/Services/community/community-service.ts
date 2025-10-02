import {
  IsDate,
  IsEmail,
  IsString,
  IsEnum,
  IsNotEmpty,
  IsDecimal,
  MaxLength,
  IsOptional,
  IsNumber,
} from "class-validator";
import { CommunityStatus } from "@prisma/client";
import prisma from "../database-service.js";
import type { PaginationResponse } from "../pagination-dto.js";


export class CommunityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string; // ct_name

  @IsString()
  @IsOptional()
  @MaxLength(100)
  alias?: string; // ct_alias

  @IsString()
  @IsNotEmpty()
  @MaxLength(90)
  type: string; // ct_type

  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  registerNumber: string; // ct_register_number

  @IsDate()
  @IsNotEmpty()
  registerDate: Date; // ct_register_date

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string; // ct_description

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  mainActivityName: string; // ct_main_activity_name

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  mainActivityDes: string; // ct_main_activity_description

  @IsEnum(CommunityStatus)
  @IsNotEmpty()
  status: CommunityStatus; // ct_status

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  phone: string; // ct_phone

  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: "rating ต้องเป็นตัวเลขทศนิยม" }
  )
  @IsNotEmpty()
  rating: number; // ✅ number รองรับทศนิยม
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(65)
  email: string; // ct_email

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bank: string; // ct_bank

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  bankAccountName: string; // ct_bank_account_name

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  bankAccountNumber: string; // ct_bank_account_number

  @IsString()
  @IsOptional()
  @MaxLength(100)
  mainAdmin?: string; // ct_main_admin

  @IsString()
  @IsOptional()
  @MaxLength(10)
  mainAdminPhone?: string; // ct_main_admin_phone

  @IsString()
  @IsOptional()
  @MaxLength(150)
  coordinatorName?: string; // ct_coordinator_name

  @IsString()
  @IsOptional()
  @MaxLength(10)
  coordinatorPhone?: string; // ct_coordinator_phone

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlWebsite?: string; // ct_url_website

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlFacebook?: string; // ct_url_facebook

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlLine?: string; // ct_url_line

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlTiktok?: string; // ct_url_tiktok

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  urlOther?: string; // ct_url_other
}

/*
 * ฟังก์ชัน: getCommunityById
 * คำอธิบาย: ใช้สำหรับค้นหาชุมชนจากฐานข้อมูลด้วยรหัสชุมชน (id)
 * Input:
 *   - id (number): รหัสชุมชน
 * Output:
 *   - community object: ข้อมูลของชุมชนที่พบ
 * Error:
 *   - throw Error หากไม่พบข้อมูลชุมชน
 */
export async function getCommunityById(id: number) {
  const community = await prisma.community.findUnique({
    where: { id: id },
  });
  if (!community) throw new Error("Community not found");
  return community;
}

/*
 * ฟังก์ชัน : getCommunityByMe
 * อธิบาย : ดึง community ที่ผู้ใช้มีสิทธิ์เข้าถึง (ขึ้นอยู่กับ role ของ user)
 * Input : id (หมายเลข userId)
 * Output : 
 *   - ถ้าเป็น admin → ได้ community ที่ตัวเองเป็น admin อยู่
 *   - ถ้าเป็น member → ได้ community ที่ตัวเองเป็นสมาชิกอยู่
 *   - ถ้าเป็น tourist หรือ role อื่น ๆ → ได้ []
 */

export const getCommunityByMe = async (
  id: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(id)) throw new Error("ID must be Number");

  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true, memberOf: true },
  });
  if (!user) throw new Error("User not found");

  const skip = (page - 1) * limit;
  let where: any = {};

  switch (user.role?.name) {
    case "admin":
      where = { adminId: user.id };
      break;
    case "member":
      if (!user.memberOf) {
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalCount: 0,
            limit,
          },
        };
      }
      where = { id: user.memberOf.id };
      break;
    default:
      return {
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          limit,
        },
      };
  }

  const totalCount = await prisma.community.count({ where });
  const communities = await prisma.community.findMany({
    where,
    orderBy: { id: "asc" },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: communities,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
    },
  };
};

/*
 * ฟังก์ชัน : getCommunityAll
 * อธิบาย : ดึง community ทั้งหมด (ใช้ได้เฉพาะ superadmin เท่านั้น)
 * Input : id (หมายเลข userId)
 * Output : 
 *   - ถ้าเป็น superadmin → ได้ community ทั้งหมด
 *   - ถ้าไม่ใช่ superadmin → ได้ []
 */
export const getCommunityAll = async (
  id: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResponse<any>> => {
  if (!Number.isInteger(id)) throw new Error("ID must be Number");

  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");

  if (user.role?.name !== "superadmin") {
    return {
      data: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalCount: 0,
        limit,
      },
    };
  }

  const skip = (page - 1) * limit;

  const totalCount = await prisma.community.count();
  const communities = await prisma.community.findMany({
    orderBy: { id: "asc" },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: communities,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
    },
  };
};