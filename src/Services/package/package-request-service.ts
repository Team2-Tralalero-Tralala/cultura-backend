// src/Services/package/package-request-service.ts
/**
 * คำอธิบาย : Service สำหรับดึง/ปรับสถานะ “คำขออนุมัติแพ็กเกจ”
 * ฟิลด์ที่ถูกส่งออกไปหน้า list:
 *  - id, name, statusApprove
 *  - community { id, name }
 *  - overseer  { id, username }
 */

import prisma from "../database-service.js";
import type { UserPayload } from "~/Libs/Types/index.js";
import type { PaginationResponse } from "~/Services/pagination-dto.js";
import type { Prisma } from "@prisma/client";

/** Payload ที่ส่งให้หน้าลิสต์ */
export type PackageRequestListItem = {
    id: number;
    name: string;
    statusApprove: string | null;
    community: { id: number; name: string };
    overseer: { id: number; username: string };
};

/**
 * ฟังก์ชัน : getPackageRequestAll
 * คำอธิบาย :
 *  - ดึงรายการคำขออนุมัติแพ็กเกจตามสิทธิ์ผู้ใช้ พร้อมค้นหา/กรอง และรองรับ pagination
 * Input :
 *  - user          : ผู้ใช้จาก token
 *  - page, limit   : ข้อมูลแบ่งหน้า
 *  - search?       : คำค้นหา (ค้นทั้งชื่อแพ็กเกจ/ชื่อชุมชน)
 *  - statusApprove?: สถานะที่ต้องการกรอง (PENDING, PENDING_SUPER, APPROVE, REJECTED, all)
 * Output :
 *  - PaginationResponse<PackageRequestListItem>
 * สิทธิ์ :
 *  - superadmin : เห็นทุกคำขอ
 *  - admin      : เห็นเฉพาะคำขอของชุมชนที่ตนดูแล (community.adminId = user.id)
 */
export async function getPackageRequestAll(
    user: UserPayload,
    page = 1,
    limit = 10,
    search?: string,
    statusApprove?: string
): Promise<PaginationResponse<PackageRequestListItem>> {
    const skip = (page - 1) * limit;

    // ค่าสถานะดีฟอลต์ (เมื่อไม่ส่งหรือส่ง "all" ให้แสดงเฉพาะที่รออนุมัติ)
    const DEFAULT_STATUSES = ["PENDING_SUPER"] as const;
    const approveFilter =
        statusApprove && statusApprove.toLowerCase() !== "all"
            ? [statusApprove]
            : [...DEFAULT_STATUSES];

    // whereBase : เงื่อนไขหลักของการค้นหา
    const whereBase: Prisma.PackageWhereInput = {
        // prisma type แคบกว่า array of string บางกรณี จึงคงรูปแบบ cast เดิมไว้เพื่อไม่เปลี่ยนพฤติกรรม
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        statusApprove: { in: approveFilter as any },
    };

    const roleLower = user.role.toLowerCase();

    if (roleLower === "superadmin") {
        // superadmin : เห็นทั้งหมด → ไม่ต้องเติมเงื่อนไขเพิ่ม
    } else if (roleLower === "admin") {
        // admin : เห็นเฉพาะแพ็กเกจของชุมชนที่ตนเป็นผู้ดูแล
        whereBase.community = { adminId: user.id };
    } else {
        // บทบาทอื่น : ไม่อนุญาต → ให้ where ไม่ตรงกับใครเลย
        whereBase.id = -1;
    }

    // คำค้นหา (optional)
    if (search && search.trim()) {
        whereBase.OR = [
            { name: { contains: search } },
            { community: { name: { contains: search } } },
        ];
    }

    // นับจำนวนทั้งหมดเพื่อทำ pagination
    const totalCount = await prisma.package.count({ where: whereBase });

    // ดึงข้อมูลรายการตามหน้า
    const rows = await prisma.package.findMany({
        where: whereBase,
        select: {
            id: true,
            name: true,
            statusApprove: true,
            community: { select: { id: true, name: true, adminId: true } },
            overseerPackage: { select: { id: true, username: true } },
        },
        orderBy: { id: "desc" },
        skip,
        take: limit,
    });

    // map เฉพาะฟิลด์ที่หน้าลิสต์ต้องใช้
    const data: PackageRequestListItem[] = rows.map((p) => ({
        id: p.id,
        name: p.name,
        statusApprove: p.statusApprove ?? null,
        community: { id: p.community.id, name: p.community.name },
        overseer: { id: p.overseerPackage.id, username: p.overseerPackage.username },
    }));

    return {
        data,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            limit,
        },
    };
}

/**
 * ฟังก์ชัน : approvePackageRequest
 * คำอธิบาย : อนุมัติคำขอ → เปลี่ยนสถานะเป็น APPROVE และล้างเหตุผลการปฏิเสธ
 * สิทธิ์ : superadmin, admin
 */
export async function approvePackageRequest(
    user: UserPayload,
    packageId: number
) {
    const roleLower = user.role?.toLowerCase();
    if (roleLower !== "superadmin" && roleLower !== "admin") {
        throw new Error("Forbidden");
    }

    return prisma.package.update({
        where: { id: packageId },
        data: { statusApprove: "APPROVE", rejectReason: null },
        select: { id: true, name: true, statusApprove: true, rejectReason: true },
    });
}

/**
 * ฟังก์ชัน : rejectPackageRequest
 * คำอธิบาย : ปฏิเสธคำขอ → บันทึกเหตุผล และตั้งสถานะเป็น REJECTED
 * สิทธิ์ : superadmin, admin
 */
export async function rejectPackageRequest(
    user: UserPayload,
    packageId: number,
    reason: string
) {
    const roleLower = user.role.toLowerCase();
    if (roleLower !== "superadmin" && roleLower !== "admin") {
        throw new Error("คุณไม่มีสิทธิ์ดำเนินการ");
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new Error("ไม่พบแพ็กเกจที่ระบุ");

    const updated = await prisma.package.update({
        where: { id: packageId },
        data: {
            rejectReason: reason.trim(),
            statusApprove: "REJECTED",
        },
        select: { id: true, name: true, statusApprove: true, rejectReason: true },
    });

    return updated;
}
import { PackageApproveStatus } from "@prisma/client";

/*
 * ฟังก์ชัน : getDetailRequestById
 * คำอธิบาย : ดึงรายละเอีดยแพ็กเกจจากหน้าคำขอของ superadmin
 * Input :
 *   - user : object ที่มีข้อมูลผู้ใช้ (ได้มาจาก middleware authentication)
 * Output :
 *   - Array ของ object ที่ประกอบด้วย:
 *       - ชื่อแพ้กเกจ
 *       - รายละเอียด
 *       - ความจุ
 *       - ราคา
 *       - วันที่เริ่มต้น
 *       - วันที่สิ้นสุด
 *       - วันที่เปิดจอง
 *       - วันที่ปิดจอง
 *       - สิ่งอำนวยความสะดวก
 *       - ชื่อผู้ดูแลแพ็กเกจ
 *       - ชื่อผู้สร้างแพ็กเกจ
 *       - แท็กของแพ็กเกจ
 *       - ไฟล์ของแพ็กเกจ
 *       - ที่ตั้งของแพ็กเกจ
 */
export const getDetailRequestById = async (packageId: number) => {
  return prisma.package.findUnique({
    where: { id: packageId, statusApprove: PackageApproveStatus.PENDING_SUPER },
    select: {
      name: true,
      statusPackage: true,
      description: true,
      capacity: true,
      price: true,
      startDate: true,
      dueDate: true,
      bookingOpenDate: true,
      bookingCloseDate: true,
      facility: true,

      overseerPackage: { select: { fname: true, lname: true } },
      createPackage:   { select: { fname: true, lname: true } },

      tagPackages: {
        select: { tag: { select: { name: true } } },
      },
      packageFile: { select: { filePath: true } },
      location: {
        select: {
          houseNumber: true,
          villageNumber: true,
          alley: true,
          subDistrict: true,
          district: true,
          province: true,
          postalCode: true,
          detail: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });
};

/*
 * ฟังก์ชัน : getDetailRequestByIdForAdmin
 * คำอธิบาย : ดึงรายละเอีดยแพ็กเกจจากหน้าคำขอของ admin
 * Input :
 *   - user : object ที่มีข้อมูลผู้ใช้ (ได้มาจาก middleware authentication)
 * Output :
 *   - Array ของ object ที่ประกอบด้วย:
 *       - ชื่อแพ้กเกจ
 *       - รายละเอียด
 *       - ความจุ
 *       - ราคา
 *       - วันที่เริ่มต้น
 *       - วันที่สิ้นสุด
 *       - วันที่เปิดจอง
 *       - วันที่ปิดจอง
 *       - สิ่งอำนวยความสะดวก
 *       - ชื่อผู้ดูแลแพ็กเกจ
 *       - ชื่อผู้สร้างแพ็กเกจ
 *       - แท็กของแพ็กเกจ
 *       - ไฟล์ของแพ็กเกจ
 *       - ที่ตั้งของแพ็กเกจ
 */
export const getDetailRequestByIdForAdmin = async (packageId: number) => {
  return prisma.package.findUnique({
    where: { id: packageId, statusApprove: PackageApproveStatus.PENDING },
    select: {
      name: true,
      description: true,
      capacity: true,
      price: true,
      startDate: true,
      dueDate: true,
      bookingOpenDate: true,
      bookingCloseDate: true,
      facility: true,

      overseerPackage: { select: { fname: true, lname: true } },
      createPackage:   { select: { fname: true, lname: true } },

      tagPackages: {
        select: { tag: { select: { name: true } } },
      },
      packageFile: { select: { filePath: true } },
      location: {
        select: {
          houseNumber: true,
          villageNumber: true,
          alley: true,
          subDistrict: true,
          district: true,
          province: true,
          postalCode: true,
          detail: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });
};


export async function approvePackageRequestForAdmin(
    user: UserPayload,
    packageId: number
) {
    const roleLower = user.role?.toLowerCase();
    if (roleLower !== "admin") {
        throw new Error("Forbidden");
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new Error("ไม่พบแพ็กเกจที่ระบุ");

    // ตรวจสอบว่าต้องเป็นสถานะ PENDING ก่อน Admin ถึงจะอนุมัติได้
    if (pkg.statusApprove !== "PENDING") {
        throw new Error(`ไม่สามารถอนุมัติได้: สถานะปัจจุบันคือ ${pkg.statusApprove}`);
    }

    // ตรวจสอบสิทธิ์ Admin (Admin ต้องเป็น adminId ของ community ที่เกี่ยวข้อง)
    if (pkg.communityId) {
        const community = await prisma.community.findUnique({ where: { id: pkg.communityId } });
        if (!community || community.adminId !== user.id) {
            throw new Error("คุณไม่มีสิทธิ์อนุมัติแพ็กเกจของชุมชนนี้");
        }
    }


    return prisma.package.update({
        where: { id: packageId },
        data: { statusApprove: "APPROVE", rejectReason: null },
        select: { id: true, name: true, statusApprove: true, rejectReason: true },
    });
}

/**
 * ฟังก์ชัน : rejectPackageRequestForAdmin
 * คำอธิบาย : Admin ปฏิเสธคำขอ → ตรวจสอบต้องเป็นสถานะ PENDING แล้วบันทึกเหตุผล และตั้งสถานะเป็น REJECTED
 * สิทธิ์ : admin
 */
export async function rejectPackageRequestForAdmin(
    user: UserPayload,
    packageId: number,
    reason: string
) {
    const roleLower = user.role.toLowerCase();
    if (roleLower !== "admin") {
        throw new Error("คุณไม่มีสิทธิ์ดำเนินการ");
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new Error("ไม่พบแพ็กเกจที่ระบุ");

    // ตรวจสอบว่าต้องเป็นสถานะ PENDING ก่อน Admin ถึงจะปฏิเสธได้
    if (pkg.statusApprove !== "PENDING") {
        throw new Error(`ไม่สามารถปฏิเสธได้: สถานะปัจจุบันคือ ${pkg.statusApprove}`);
    }

    // ตรวจสอบสิทธิ์ Admin (Admin ต้องเป็น adminId ของ community ที่เกี่ยวข้อง)
    if (pkg.communityId) {
        const community = await prisma.community.findUnique({ where: { id: pkg.communityId } });
        if (!community || community.adminId !== user.id) {
            throw new Error("คุณไม่มีสิทธิ์ปฏิเสธแพ็กเกจของชุมชนนี้");
        }
    }

    const updated = await prisma.package.update({
        where: { id: packageId },
        data: {
            rejectReason: reason.trim(),
            statusApprove: PackageApproveStatus.REJECTED,
        },
        select: { id: true, name: true, statusApprove: true, rejectReason: true },
    });

    return updated;
}