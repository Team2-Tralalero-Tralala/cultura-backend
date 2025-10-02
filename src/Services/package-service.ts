import prisma from './database-service.js';

export const getPackageById = async (id: number) => {
  return await prisma.package.findUnique({
    where: { id },
  });
};