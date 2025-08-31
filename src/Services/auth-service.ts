import bcrypt from "bcrypt";
import prisma from "./database-service.js";
import { IsEmail, IsString } from "class-validator";


async function findRoleIdByName(name: string) {
  const role = await prisma.role.findUnique({ where: { name } });
  if (!role) throw new Error("Role not found");
  return role.id;
}

export class signupDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  fname: string;
  @IsString()
  lname: string;
  @IsString()
  phone: string;
  @IsString()
  role: string;
}

export async function signup(data: signupDto) {
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

export class loginDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}

export async function login(data: loginDto) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.username }],
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
