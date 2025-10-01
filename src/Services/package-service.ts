import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPackageById = async (id: number) => {
  return await prisma.package.findUnique({
    where: { id },
  });
};