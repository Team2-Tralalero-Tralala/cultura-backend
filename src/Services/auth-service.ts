import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

export const prisma = new PrismaClient();

async function findRoleIdByName(name: string) {
  const role = await prisma.role.findUnique({ where: { name } });
  if (!role) throw new Error("Role not found");
  return role.id;
}

export async function signup(data: {
  username: string;
  password: string;
  email: string;
  fname: string;
  lname: string;
  phone: string;
  role: string;
}) {
  const account = await prisma.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { email: data.email },
        { phone: data.phone },
      ],
    },
  });

  if (account) throw new Error("Username or email already exists");

  const roleId = await findRoleIdByName(data.role);
  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashed,
      fname: data.fname,
      lname: data.lname,
      phone: data.phone,
      roleId,
    },
    include: { role: true },
  });
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function login(data: {
  email: string;
  username: string;
  password: string;
}) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.email }],
    },
    include: { role: true },
  });
  if (!user) throw new Error("User not found");

  // Check password

  const match = await bcrypt.compare(data.password, user.password);
  if (!match) throw new Error("Invalid password");

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role.name,
    fname: user.fname,
    lname: user.lname,
    phone: user.phone,
  };

  return { user: safeUser };
}
