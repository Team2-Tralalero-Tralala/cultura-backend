import prisma from "../database-service.js";
import type { UserPayload } from "~/Libs/Types/index.js";

/**
 * ฟังก์ชัน : getPackageFeedbacksByPackageId
 * คำอธิบาย : ดึงรายการ Feedback ของแพ็กเกจตามรหัสแพ็กเกจ (เฉพาะแอดมิน)
 * Input : packageId, user (UserPayload)
 * Output : Feedback ทั้งหมดของแพ็กเกจนั้น
 * เฉพาะกรณีที่แพ็กเกจอยู่ใน community ของแอดมินเท่านั้น
 */
export const getPackageFeedbacksByPackageIdAdmin = async (
  packageId: number,
  user: UserPayload
) => {
  const packageInCommunity = await prisma.package.findFirst({
    where: {
      id: packageId,
      community: {
        adminId: user.id,
      },
    },
    select: { id: true },
  });

  if (!packageInCommunity) {
    throw new Error("Package not found in your community");
  }

  const feedbacks = await prisma.feedback.findMany({
    where: {
      bookingHistory: {
        packageId: packageId,
      },
    },
    select: {
      id: true,
      createdAt: true,
      rating: true,
      message: true,
      feedbackImages: {
        select: { image: true },
      },
      bookingHistory: {
        select: {
          tourist: { select: { fname: true, lname: true } },
          package: { select: { name: true } },
        },
      },
    },
  });

  // ถ้าไม่มี feedback
  if (!feedbacks || feedbacks.length === 0) {
    throw new Error("No feedback found for this package");
  }

  return feedbacks;
};

export default getPackageFeedbacksByPackageIdAdmin;

/*
 * ฟังก์ชัน : getPackageFeedbacksByPackageIdMember
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อเสนอแนะของแพ็กเกจ
 *             สำหรับสมาชิก (Member) ที่ต้องการดูข้อเสนอแนะของแพ็กเกจของตน
 * Input : packageId (หมายเลขแพ็กเกจ), user (ข้อมูลผู้ใช้ที่ร้องขอ)
 * Output : รายการข้อเสนอแนะของแพ็กเกจ
 */
export async function getPackageFeedbacksByPackageIdMember(
  packageId: number,
  user: UserPayload
) {
  if (user.role !== "member") {
    throw new Error("ผู้ใช้ไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
  }

  return prisma.feedback.findMany({
    where: {
      bookingHistory: {
        packageId: packageId,
        package: {
          overseerMemberId: user.id,
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
      rating: true,
      message: true,
      feedbackImages: {
        select: { image: true },
      },
      bookingHistory: {
        select: {
          tourist: { select: { fname: true, lname: true } },
          package: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}