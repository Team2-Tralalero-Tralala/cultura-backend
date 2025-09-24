import prisma from "./database-service.js";
import type { PackageDto } from "./package/package-dto.js";

export const createPackage = async (data: PackageDto) => {
    return await prisma.package.create({ 
        data: {
            communityId: data.communityId,      // ต้องเป็น number
            locationId: data.locationId,        // number
            overseerMemberId: data.overseerMemberId, // number
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            price: data.price,
            warning: data.warning,
            statusPackage: data.statusPackage,
            statusApprove: data.statusApprove,
            startDate: new Date(data.startDate),
            dueDate: new Date(data.dueDate),
            facility: data.facility,
        }
     });
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
