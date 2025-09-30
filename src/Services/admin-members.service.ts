// ดึงเฉพาะข้อมูลสำหรับตาราง: username, roleName, email + pagination
import prisma from "./database-service.js";

export type AdminMemberRow = {
  username: string;
  roleName: string;
  email: string;
};

type ListOptions = {
  skip?: number;         // default 0
  take?: number;         // default 10 (max 100)
  search?: string;       // ค้นหาจาก username/email
};

export async function listCommunityMembers(
  communityId: number,
  opts: ListOptions = {}
): Promise<{ items: AdminMemberRow[]; total: number }> {
  const skip = Math.max(0, Number.isFinite(opts.skip) ? Number(opts.skip) : 0);
  const takeInit = Number.isFinite(opts.take) ? Number(opts.take) : 10;
  const take = Math.min(Math.max(1, takeInit), 100);
  const search = (opts.search ?? "").trim();

  const where = {
    memberOfCommunity: communityId,
    role: { name: "member" as const },
    ...(search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        username: true,
        email: true,
        role: { select: { name: true } },
      },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  const items: AdminMemberRow[] = rows.map((u) => ({
    username: u.username,
    roleName: u.role?.name ?? "",
    email: u.email,
  }));

  return { items, total };
}
