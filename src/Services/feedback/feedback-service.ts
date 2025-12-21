import prisma from "../database-service.js";
import type { UserPayload } from "~/Libs/Types/index.js";

/**
 * คำอธิบาย : ดึงรายการ Feedback ของแพ็กเกจตามรหัสแพ็กเกจ
 * Input :
 *  - packageId : number (รหัสแพ็กเกจ)
 *  - user : UserPayload (ข้อมูลผู้ใช้ที่เป็นแอดมิน)
 * Output : รายการ Feedback ทั้งหมดของแพ็กเกจ
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
      replyMessage: true,
      replyAt: true,
      responder: {
        select: {
          fname: true,
          lname: true,
        },
      },
    },
  });

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
        { createById: user.id }, // เงื่อนไข 1: เป็นคนสร้าง
        { overseerMemberId: user.id }, // เงื่อนไข 2: เป็นผู้รับผิดชอบ
      ],
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
              createdAt: "desc", // เรียง feedback ล่าสุดขึ้นก่อน
            },
          },
        },
        // กรองเฉพาะ Booking ที่มี Feedback แล้ว (Optional: ถ้าอยากได้เฉพาะที่มีรีวิว)
        where: {
          feedbacks: {
            some: {},
          },
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  // จัดโครงสร้างส่งกลับให้ Frontend (ให้เหมือนกับที่ FE รอรับ)
  return {
    packages: myPackages,
  };
};

/**
 * คำอธิบาย : ตอบกลับ Feedback
 * Input :
 *   - feedbackId : Feedback ที่ต้องการตอบกลับ
 *   - replyMessage : ข้อความตอบกลับรีวิว
 *   - user : ข้อมูลผู้ใช้งานที่ทำการตอบกลับ
 * Output : ข้อมูล Feedback ที่ถูกอัปเดตแล้ว เฉพาะส่วนของการตอบกลับ
 */
export const replyFeedbackMember = async (
  feedbackId: number,
  replyMessage: string,
  user: UserPayload | undefined
) => {
  if (!user || user.role !== "member") {
    throw new Error("อนุญาตเฉพาะผู้ใช้ที่มีบทบาทเป็น Member เท่านั้น");
  }

  if (typeof feedbackId !== "number" || Number.isNaN(feedbackId)) {
    throw new Error("feedbackId ต้องเป็นตัวเลข");
  }

  if (typeof replyMessage !== "string") {
    throw new Error("ข้อความตอบกลับต้อง String");
  }

  const updatedFeedback = await prisma.feedback.update({
    where: { id: feedbackId },
    data: {
      replyMessage: replyMessage,
      replyAt: new Date(),
      responderId: user.id,
    },
    select: {
      id: true,
      replyMessage: true,
      replyAt: true,
      responderId: true,

      responder: {
        select: {
          fname: true,
          lname: true,
        },
      },
    },
  });

  return updatedFeedback;
};

/**
 * คำอธิบาย : ดึงรายการ Feedback ของแพ็กเกจตามรหัสแพ็กเกจ
 * Input :
 *  - packageId : number (รหัสแพ็กเกจ)
 *  - user : UserPayload (ข้อมูลผู้ใช้ที่เป็นแอดมิน)
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
      replyMessage: true,
      replyAt: true,
      responder: {
        select: {
          fname: true,
          lname: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}


/**
 * คำอธิบาย : ตอบกลับ Feedback
 * Input :
 *   - feedbackId : Feedback ที่ต้องการตอบกลับ
 *   - replyMessage : ข้อความตอบกลับรีวิว
 *   - user : ข้อมูลผู้ใช้งานที่ทำการตอบกลับ
 * Output : ข้อมูล Feedback ที่ถูกอัปเดตแล้ว เฉพาะส่วนของการตอบกลับ
 */
export const replyFeedbackAdmin = async (
  feedbackId: number,
  replyMessage: string,
  user: UserPayload | undefined
) => {
  if (!user || user.role !== "admin") {
    throw new Error("อนุญาตเฉพาะผู้ใช้ที่มีบทบาทเป็น admin เท่านั้น");
  }

  if (typeof feedbackId !== "number" || Number.isNaN(feedbackId)) {
    throw new Error("feedbackId ต้องเป็นตัวเลข");
  }

  if (typeof replyMessage !== "string") {
    throw new Error("ข้อความตอบกลับต้อง String");
  }

  const updatedFeedback = await prisma.feedback.update({
    where: { id: feedbackId },
    data: {
      replyMessage: replyMessage,
      replyAt: new Date(),
      responderId: user.id,
    },
    select: {
      id: true,
      replyMessage: true,
      replyAt: true,
      responderId: true,

      responder: {
        select: {
          fname: true,
          lname: true,
        },
      },
    },
  });

  return updatedFeedback;
};
