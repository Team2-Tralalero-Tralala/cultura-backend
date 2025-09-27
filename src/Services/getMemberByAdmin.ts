// src/Services/admin-members.service.ts
import prisma from "./database-service.js";

export type AdminMember = {
  username: string;
  roleName: string;
  email: string;
};

/** ดึงสมาชิกของชุมชนสำหรับแอดมิน: username, roleName, email */
export async function getMemberByAdmin(communityId: number): Promise<AdminMember[]> {
  // 1) ดึง membership (ไม่พึ่ง relation)
  const memberships = await prisma.communityMember.findMany({
    where: { communityId },
    select: { memberId: true, roleId: true },
    orderBy: { memberId: "desc" }, // CommunityMember ไม่มีฟิลด์ id
  });

  if (memberships.length === 0) return [];

  // 2) ดึง Users/Roles ชุดเดียวตาม id ที่เจอ
  const memberIds = [...new Set(memberships.map(m => m.memberId))];
  const roleIds   = [...new Set(memberships.map(m => m.roleId).filter((x): x is number => Number.isFinite(x)))];

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, username: true, email: true },
    }),
    roleIds.length
      ? prisma.role.findMany({ where: { id: { in: roleIds } }, select: { id: true, name: true } })
      : Promise.resolve([] as { id: number; name: string }[]),
  ]);

  const userMap = new Map(users.map(u => [u.id, u]));
  const roleMap = new Map(roles.map(r => [r.id, r.name]));

  // 3) map ผลเหลือ 3 ฟิลด์
  return memberships
    .map(m => {
      const u = userMap.get(m.memberId);
      if (!u) return null;
      return {
        username: u.username,
        roleName: roleMap.get(m.roleId as number) ?? "",
        email: u.email,
      };
    })
    .filter(Boolean) as AdminMember[];
}
