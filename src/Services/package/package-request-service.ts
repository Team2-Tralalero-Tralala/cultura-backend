import prisma from "../database-service.js";
import { PackageApproveStatus } from "@prisma/client";

/*
 * ฟังก์ชัน : getDetailRequestById
 * คำอธิบาย : ดึงประวัติการจอง (bookingHistory) ตามสิทธิ์ของผู้ใช้งาน
 * Input :
 *   - user : object ที่มีข้อมูลผู้ใช้ (ได้มาจาก middleware authentication)
 * Output :
 *   - Array ของ object ที่ประกอบด้วย:
 *       - ชื่อผู้จอง
 *       - ชื่อกิจกรรม
 *       - ราคา
 *       - สถานะ
 *       - หลักฐานการโอน
 *       - เวลาในการจอง
 */
export const getDetailRequestById = async (packageId: number) => {
    return prisma.package.findUnique({
        where: { id: packageId, statusApprove: PackageApproveStatus.PENDING_SUPER },
        select: {
            name: true,
            description: true,
            capacity: true,
            price: true,
            overseerMemberId: true,
            createById: true,
            startDate: true,
            dueDate: true,
            bookingOpenDate: true,
            bookingCloseDate: true,
            facility: true,
            tagPackages: {
                select: {
                    tag: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            packageFile: {
                select: {
                    filePath: true
                }
            },
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
