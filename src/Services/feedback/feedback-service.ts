import prisma from "../database-service.js";
import type { UserPayload } from "~/Libs/Types/index.js";

/**
 * ฟังก์ชัน : getPackageFeedbacksByPackageId
 * คำอธิบาย : ดึงรายการ Feedback ของแพ็กเกจตามรหัสแพ็กเกจ (เฉพาะแอดมิน)
 * Input : packageId, user (UserPayload)
 * Output : Feedback ทั้งหมดของแพ็กเกจนั้น
 * เฉพาะกรณีที่แพ็กเกจอยู่ใน community ของแอดมินเท่านั้น
 */
export const getPackageFeedbacksByPackageId = async (
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

/**
 * ฟังก์ชัน : getMemberPackageFeedbacks
 * คำอธิบาย : ดึงรายการ Feedback ของแพ็กเกจตามรหัสแพ็กเกจ (เฉพาะ Member เจ้าของแพ็กเกจ)
 * Input : packageId, user (UserPayload)
 * Output : Feedback ทั้งหมดของแพ็กเกจนั้น
 * เงื่อนไข : ต้องเป็นแพ็กเกจที่ user คนนั้นเป็นคนสร้าง (createBy)
 */
export const getAllMemberFeedbacks = async (user: UserPayload) => {
  // query เริ่มจาก Package ของ user คนนั้น
  const myPackages = await prisma.package.findMany({
    where: {
      OR: [
        { createById: user.id },       // เงื่อนไข 1: เป็นคนสร้าง
        { overseerMemberId: user.id }  // เงื่อนไข 2: เป็นผู้รับผิดชอบ 
      ]
    },
    select: {
      id: true,
      name: true,
      // ดึง BookingHistory -> Feedback
      bookingHistories: {
        select: {
          id: true,
          touristId: true,
          packageId: true,
          status: true,
          totalParticipant: true,
          feedbacks: {
            select: {
              id: true,
              bookingHistoryId: true,
              createdAt: true,
              message: true,
              rating: true,
              responderId: true,
              replyAt: true,
              replyMessage: true,
              feedbackImages: {
                select: { id: true, feedbackId: true, image: true },
              },
            },
            orderBy: {
              createdAt: 'desc' // เรียง feedback ล่าสุดขึ้นก่อน
            }
          },
        },
        // กรองเฉพาะ Booking ที่มี Feedback แล้ว (Optional: ถ้าอยากได้เฉพาะที่มีรีวิว)
        where: {
          feedbacks: {
            some: {}
          }
        }
      },
    },
    orderBy: {
      id: 'desc'
    }
  });

  // จัดโครงสร้างส่งกลับให้ Frontend (ให้เหมือนกับที่ FE รอรับ)
  return {
    packages: myPackages
  };
};

export default getPackageFeedbacksByPackageId;
