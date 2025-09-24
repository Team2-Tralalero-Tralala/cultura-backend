// src/Services/admin-members.service.ts
import prisma from "./database-service.js";

export type AdminMember = {
  username: string;
  roleName: string; // ชื่อบทบาท (ว่างได้ถ้ายังไม่มี role)
  email: string;
};

/** ดึงข้อมูลสมาชิกสำหรับแอดมิน: username, roleName, email */
export async function getMemberByAdmin(): Promise<AdminMember[]> {
  // ดึงเฉพาะฟิลด์ที่ต้องใช้ + roleId เพื่อ map เป็นชื่อบทบาท
  const users = await prisma.user.findMany({
    select: { username: true, email: true, roleId: true },
    orderBy: { id: "desc" },
  });

  // ดึง role ที่เกี่ยวข้องครั้งเดียว (ถ้าไม่มี roleIds ก็ข้าม)
  const roleIds = [...new Set(users.map(u => u.roleId).filter((x): x is number => Number.isFinite(x)))];
  const roles = roleIds.length
    ? await prisma.role.findMany({ where: { id: { in: roleIds } }, select: { id: true, name: true } })
    : [];
  const roleMap = Object.fromEntries(roles.map(r => [r.id, r.name]));

  // แปลงผลให้เหลือ 3 ฟิลด์
  return users.map(u => ({
    username: u.username,
    roleName: roleMap[u.roleId] ?? "",
    email: u.email,
  }));
}
