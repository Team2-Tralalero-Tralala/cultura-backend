import prisma from "../database-service.js";

/**
 * ฟังก์ชัน : getPackageFeedbacksByPackageId
 * คำอธิบาย : ดึงรายการ Feedback ของแพ็กเกจตามรหัสแพ็กเกจที่กำหนด
 * Input : packageId รหัสของแพ็กเกจที่ต้องการดึง Feedback
 * Output : รายการ Feedback ที่มีข้อมูลเรตติ้ง ข้อความ รูปภาพ และข้อมูลผู้จอง
 */
export const getPackageFeedbacksByPackageId = async (packageId: number) => {
  return prisma.feedback.findMany({
    where: {
      bookingHistory: { packageId },
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
          tourist: {
            select: {
              fname: true,
              lname: true,
            },
          },
          package: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
};

export default getPackageFeedbacksByPackageId;