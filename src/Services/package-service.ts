import prisma from "./database-service.js";

export const createPackage = async (data: any) => {
    return await prisma.package.create({ data });
};

export const editPackage = async (id: number, data: any) => {
    return await prisma.package.update({ 
        where: { id: id }, data});
};

export const getPackageByRole = async (id: number) => {
    return await prisma.package.findMany({
        where: { id: id }
    })
}

export const getPackageByMemberID = async (id: number) => {
    return await prisma.package.findMany({
        where: { overseerMemberId: id }
    });
};

export const deletePackage = async (id: number) => {
    return await prisma.package.delete({
        where: { id: id }
    });
};
