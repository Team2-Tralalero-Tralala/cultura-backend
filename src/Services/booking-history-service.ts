import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type userAttribute = {
  id: number;
  role: "tourist" | "member" | "admin";
  communityId?: number;
};

/*
 * ฟังก์ชัน : getHistoriesByRole
 * คำอธิบาย : ดึงประวัติการจอง (bookingHistory) ตามสิทธิ์ของผู้ใช้งาน
 * Input :
 *   - user : UserShape (id, role, communityId)
 * Output :
 *   - Array ของ object ที่ประกอบด้วย:
 *       - ชื่อผู้จอง
 *       - ชื่อกิจกรรม
 *       - ราคา
 *       - สถานะ
 *       - หลักฐานการโอน
 *       - เวลาในการจอง
 */
export const getHistoriesByRole = async (user: userAttribute) => {
  if (!["tourist", "member", "admin"].includes(user.role)) {
    throw new Error("Invalid user role: must be tourist, member, or admin");
  }
  let where: any = {};
  if (user.role === "tourist") {
    where = { touristId: user.id };
  } else if (user.role === "member") {
    where = { package: { overseerMemberId: user.id } };
  } else if (user.role === "admin") {
    where = { package: { community: { adminId: user.id } } };
  }

  const data = await prisma.bookingHistory.findMany({
    skip: 0,
    take: 10,
    where,
    include: {
      tourist: { select: { fname: true, lname: true } },
      package: { select: { name: true, price: true } },
    },
    orderBy: { bookingAt: "desc" },
  });

  return data.map((item: any) => ({
    touristName: `${item.tourist?.fname ?? ""} ${item.tourist?.lname ?? ""}`.trim(),
    packageName: item.package?.name ?? "",
    price: item.package?.price ?? 0,
    status: item.status ?? item.bh_status ?? "",
    slip: item.transferSlip ?? item.bh_transfer_slip ?? null,
    bookingAt: item.bookingAt ?? item.bh_booking_at ?? null,
  }));
};
/*
 touristId: data.touristId,
            packageId: data.packageId,
            bookingAt: data.bookingAt,
            cancelAt: data.cancelAt ?? null,
            refundAt: data.refundAt ?? null,
            status: data.status ?? "PENDING",
            totalParticipant: data.totalParticipant,
            rejectReason: data.rejectReason ?? null,
*/
