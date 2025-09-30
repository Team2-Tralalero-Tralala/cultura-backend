import prisma from "../database-service.js";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้าง Booking History ใหม่
 * Input  : 
 *   - data: object {
 *       touristId: number (รหัสผู้จอง),
 *       packageId: number (รหัสแพ็กเกจ),
 *       bookingAt: string (เวลาจอง),
 *       cancelAt?: string | null (เวลายกเลิก),
 *       refundAt?: string | null (เวลาคืนเงิน),
 *       status?: string (สถานะการจอง, ค่าเริ่มต้น "PENDING"),
 *       totalParticipant: number (จำนวนผู้เข้าร่วม),
 *       rejectReason?: string | null (เหตุผลที่ถูกปฏิเสธ)
 *   }
 * Output : BookingHistory object ที่ถูกสร้างใหม่ในฐานข้อมูล
 */
export const createBooking = async(data: any) => {
    const packageId = await prisma.package.findUnique({
        where: { id: Number(data.packageId) }
    });
    if (!packageId) {
        throw new Error(`Package ID ${data.packageId} ไม่พบในระบบ`);
    }

    const userId = await prisma.user.findUnique({
        where: { id: Number(data.touristId) }
    }); 
    if (!userId) {
        throw new Error(`User ID ${data.touristId} ไม่พบในระบบ`);
    }

    return await prisma.bookingHistory.create({
        data : {
            touristId: data.touristId,
            packageId: data.packageId,
            bookingAt: data.bookingAt,
            cancelAt: data.cancelAt ?? null,
            refundAt: data.refundAt ?? null,
            status: data.status ?? "PENDING",
            totalParticipant: data.totalParticipant,
            rejectReason: data.rejectReason ?? null,
        }
    });

}