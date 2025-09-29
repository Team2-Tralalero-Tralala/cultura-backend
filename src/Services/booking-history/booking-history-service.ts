import prisma from "../database-service.js";

export const createBookingHistory = async(data: any) => {
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