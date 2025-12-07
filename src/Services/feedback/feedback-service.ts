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

  if (!feedbacks || feedbacks.length === 0) {
    throw new Error("No feedback found for this package");
  }

  return feedbacks;
};

export default getPackageFeedbacksByPackageIdAdmin;




/*
 * ฟังก์ชัน : replyFeedbackService
 * คำอธิบาย : ฟังก์ชันสำหรับรตอบกลับ Feedback
 * โดยจะอัปเดตเฉพาะฟิลด์ replyMessage, replyAt และ responderId
 *
 * Input :
 *   - feedbackId : Feedback ที่ต้องการตอบกลับ
 *   - replyMessage : ข้อความตอบกลับรีวิว
 *   - user : ข้อมูลผู้ใช้งานที่ทำการตอบกลับ
 *
 * Output :
 *   - ข้อมูล Feedback ที่ถูกอัปเดตแล้ว เฉพาะส่วนของการตอบกลับ
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

