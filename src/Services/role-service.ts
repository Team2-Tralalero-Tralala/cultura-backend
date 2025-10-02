import bcrypt from "bcrypt";
import prisma from "./database-service.js";

export async function findRoleIdByName(name: string) {
  const role = await prisma.role.findUnique({ where: { name } });
  if (!role) throw new Error("Role not found");
  return role.id;
}

export async function create(data: {
  name: string;
}) {
  const role = await prisma.role.findFirst({
    where: {
      name: data.name
    },
  });

  if (role) throw new Error("Role already exists");

  const newRole = await prisma.role.create({
    data: {
      name: data.name
    },
  });
  return newRole;
}