import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type UserShape = {
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
export const getHistoriesByRole = async (user: UserShape) => {
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
    ชื่อผู้จอง: `${item.tourist?.fname ?? ""} ${item.tourist?.lname ?? ""}`.trim(),
    ชื่อกิจกรรม: item.package?.name ?? "",
    ราคา: item.package?.price ?? 0,
    สถานะ: item.status ?? item.bh_status ?? "",
    หลักฐาน: item.transferSlip ?? item.bh_transfer_slip ?? null,
    เวลา: item.bookingAt ?? item.bh_booking_at ?? null,
  }));
};
