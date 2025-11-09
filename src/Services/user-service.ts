// 📄 user-service.ts
import prisma from "../Services/database-service.js";

/*
 * คำอธิบาย : Service สำหรับจัดการข้อมูลผู้ใช้งาน (User)
 * ฟังก์ชันในไฟล์นี้เกี่ยวข้องกับการเข้าถึงฐานข้อมูลของตาราง users
 * โดยใช้ Prisma ORM ในการเชื่อมต่อกับ MySQL
 */

/**
 * ฟังก์ชัน : getAllUsersService
 * คำอธิบาย : ดึงข้อมูลผู้ใช้งานทั้งหมดในระบบ
 * Input : ไม่มี
 * Output : รายการผู้ใช้งานทั้งหมด (Array of User)
 */
export const getAllUsersService = async () => {
  try {
    // ✅ ดึงข้อมูลผู้ใช้งานทั้งหมดจากตาราง users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fname: true,
        lname: true,
        email: true,
        phone: true,
        gender: true,
        birthDate: true,
        role: {
          select: {
            id: true,
            name: true, // SUPERADMIN / ADMIN / MEMBER / TOURIST
          },
        },
        memberOf: {
          select: {
            id: true,
            name: true, // ชื่อชุมชนที่เป็นสมาชิก
          },
        },
        status: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return users;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน:", error);
    throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้งานได้ในขณะนี้");
  }
};

/**
 * ฟังก์ชัน : getUserByIdService
 * คำอธิบาย : ดึงข้อมูลผู้ใช้งานตาม ID
 * Input : userId (number)
 * Output : รายละเอียดผู้ใช้งาน 1 รายการ
 */
export const getUserByIdService = async (userId: number) => {
  try {
    if (!userId) {
      throw new Error("กรุณาระบุรหัสผู้ใช้งาน");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fname: true,
        lname: true,
        email: true,
        phone: true,
        gender: true,
        birthDate: true,
        role: {
          select: { id: true, name: true },
        },
        memberOf: {
          select: { id: true, name: true },
        },
        status: true,
      },
    });

    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้งาน");
    }

    return user;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งานตาม ID:", error);
    throw error;
  }
};
