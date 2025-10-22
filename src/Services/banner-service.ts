/* 
 * File: banner-service.ts
 * Module: Banner Service (Prisma)
 * มาตรฐาน: CS v1.1.1 (คอมเมนต์ไทย), Error-handling เบื้องต้น, Side-effect file delete หลัง DB สำเร็จ
 * หน้าที่:
 *   - เพิ่ม/อ่าน/แก้ไข/ลบข้อมูลแบนเนอร์ (image path) ในตาราง prisma.banner
 *   - ลบไฟล์รูปเก่าออกจากสตอเรจ เมื่อเกิดการอัปเดต/ลบในฐานข้อมูลสำเร็จเท่านั้น
 * หมายเหตุความปลอดภัย:
 *   - ไม่ยอมให้แก้ไขค่า id ของแถว (ห้าม set id ตอน update)
 *   - ตรวจอินพุตพื้นฐาน (เช่น path ว่าง) และคืนค่าที่ชัดเจน
 */

import prisma from "./database-service.js";
import { deleteFileIfExists, toStorageAbsPath } from "~/Libs/fs-utils.js";

/* ---------- Types ---------- */

/** โครงสร้างไฟล์ที่อัปโหลดมาจาก middleware (ใช้บางฟิลด์เท่านั้น) */
export type BannerInput = {
    order: number;        // 1-based index (ยังไม่ได้ใช้บันทึกใน DB)
    key: string;          // ชื่อไฟล์ภายในระบบอัปโหลด
    originalName: string; // ชื่อไฟล์เดิมจากผู้ใช้
    mime: string;         // mimetype
    size: number;         // bytes
    path: string;         // relative storage path (บันทึกลง DB)
};
export type BannerBatchInput = BannerInput[];

/** โครงสร้าง DTO ที่คืนออกไปให้ชั้นอื่นใช้งาน */
export type BannerDto = {
    id: number;
    image: string;
};

/** payload สำหรับแก้ไขเส้นทางรูปของ Banner */
export type EditBannerPayload = {
    path: string; // relative storage path ใหม่
};

/* ---------- Services ---------- */

/**
 * ฟังก์ชัน: addBanner
 * คำอธิบาย: เพิ่มรายการแบนเนอร์แบบหลายรายการ (bulk) โดยบันทึกเฉพาะ path ลง DB
 * Input  : payload: BannerInput[] (ต้องมี path)
 * Output : Promise<BannerDto[]>
 * หมายเหตุ:
 *   - ใช้ $transaction เพื่อให้การสร้างหลายเรคคอร์ด atomic
 *   - ข้ามรายการที่ไม่มี path (ป้องกันข้อมูลเสีย)
 */
export async function addBanner(payload: BannerBatchInput): Promise<BannerDto[]> {
    const items = (payload ?? []).filter((p) => !!p?.path);
    if (!items.length) return [];

    const created = await prisma.$transaction(
        items.map((c) =>
            prisma.banner.create({
                data: { image: c.path }, // ไม่แตะ id (auto-increment)
                select: { id: true, image: true },
            })
        )
    );

    return created; //: BannerDto[]
}

/**
 * ฟังก์ชัน: getBanner
 * คำอธิบาย: ดึงรายการแบนเนอร์ทั้งหมด
 * Input  : -
 * Output : Promise<BannerDto[]>
 */
export async function getBanner(): Promise<BannerDto[]> {
    return prisma.banner.findMany({
        select: { id: true, image: true },
    });
}

/**
 * ฟังก์ชัน: editBanner
 * คำอธิบาย: แก้ไข path ของรูปแบนเนอร์ และลบไฟล์รูปเก่าหลังอัปเดตสำเร็จ
 * Input  : id: number, payload: { path: string }
 * Output : Promise<BannerDto> (รายการที่อัปเดตแล้ว)
 * ข้อควรระวัง:
 *   - ไม่อนุญาตให้แก้ไข id ใน data update
 *   - ลบไฟล์เก่า *หลังจาก* อัปเดต DB สำเร็จเท่านั้น
 */
export async function editBanner(id: number, payload: EditBannerPayload): Promise<BannerDto> {
    if (!id || !payload?.path) {
        throw new Error("Invalid editBanner payload: id and path are required.");
    }

    // อ่านค่าเดิมเพื่อตรวจว่ามีอยู่จริง และเก็บ path เก่าไว้ลบทีหลัง
    const prev = await prisma.banner.findUnique({
        where: { id },
        select: { id: true, image: true },
    });
    if (!prev) {
        throw new Error(`Banner not found (id=${id})`);
    }

    // อัปเดตเฉพาะฟิลด์ image
    const updated = await prisma.banner.update({
        where: { id },
        data: { image: payload.path },
        select: { id: true, image: true },
    });

    // ลบไฟล์เดิม ถ้า path เปลี่ยนจริง
    const oldPath = prev.image;
    if (oldPath && oldPath !== payload.path) {
        try {
            await deleteFileIfExists(toStorageAbsPath(oldPath));
        } catch {
            // โน้ต: ไม่ throw ต่อ เพื่อไม่ให้การใช้งานล้มเหลวจากการลบไฟล์ (สามารถ log แยกได้)
        }
    }

    return updated;
}

/**
 * ฟังก์ชัน: deleteBanner
 * คำอธิบาย: ลบเรคคอร์ดแบนเนอร์ และลบไฟล์รูปที่เกี่ยวข้อง
 * Input  : id: number
 * Output : Promise<BannerDto> (ข้อมูลที่ถูกลบ เผื่อผู้เรียกจะใช้แสดงผล/undo)
 * หมายเหตุ:
 *   - ลบไฟล์หลัง delete สำเร็จ (ป้องกัน orphan DB ถ้าลบไฟล์ก่อนแล้ว DB ล้มเหลว)
 */
export async function deleteBanner(id: number): Promise<BannerDto> {
    if (!id) {
        throw new Error("Invalid deleteBanner payload: id is required.");
    }

    // อ่านก่อนลบเพื่อเก็บ path ไว้ลบไฟล์
    const prev = await prisma.banner.findUnique({
        where: { id },
        select: { id: true, image: true },
    });
    if (!prev) {
        throw new Error(`Banner not found (id=${id})`);
    }

    // ลบจากฐานข้อมูล
    const deleted = await prisma.banner.delete({
        where: { id },
        select: { id: true, image: true },
    });

    // ลบไฟล์หลัง DB สำเร็จ
    const oldPath = prev.image;
    if (oldPath) {
        try {
            await deleteFileIfExists(toStorageAbsPath(oldPath));
        } catch {
            // เก็บเป็น soft-failure ของงานลบไฟล์ (สามารถ log ได้หากต้องการ)
        }
    }

    return deleted;
}
