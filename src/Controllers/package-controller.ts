import type { Request, Response } from "express";
import * as PackageService from "../Services/package-service.js";
import prisma from "~/Services/database-service.js";
import type { commonDto } from "~/Libs/Types/TypedHandler.js";
import { PackageDto, updatePackageDto } from "~/Services/package/package-dto.js";

export const createPackageDto = {
  body: PackageDto,
} satisfies commonDto;


export const createPackage = async (req: Request, res: Response) => {
    try {
        const result = await PackageService.createPackage(req.body);
        return res.json({ status:200, data: result });
    } catch (error: any) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

export const getPackageByRole = async (req: Request, res: Response) => {
    try {
        const { id } = (req.params);
        if (!Number(id)){
            return res.status(400).json({ status: 400, message: "ID must be Number" })  
        }
        /* ********************************************************** */
        /* ไม่แน่ใจว่าต้องรอดึงของ getUserRole ของฝั่ง User ไหม */
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            include: { role: true, communityMembers: true }
        });

        if (!user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        let result: any;
        switch (user.roleId) {
            case 1: //tourist
                // ไม่สามารถเข้าถึงข้อมูลได้
                result = [];
                console.log("นี้คือ Member", result);
                break;
            case 2: //superadmin
                result = await prisma.package.findMany();
                console.log("นี้คือ Super Admin", result);
                break;
            case 3: //member
                result = await prisma.package.findMany({
                    where: { overseerMemberId: user.id }
                });
                console.log("นี้คือ Member", result);
                break;
            case 4://admin
            const communityIds = user.communityMembers?.map(cm => cm.communityId);
                result = await prisma.package.findMany({
                    where: { communityId: { in: communityIds } }
                });
                console.log("นี้คือ Admin", result);
                break;
            default:
                return res.status(400).json({ status: 400, message: "Invalid user role" });
        }
        res.json({ status: 200, role: user.roleId, data: result });
        /* ********************************************************** */
    } catch (error: any) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

export const getPackageByMemberID = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 400, message: "memberID is require" })
        }
        const result = await PackageService.getPackageByMemberID(Number(id));
        res.json({ status: 200, data: result});
    } catch (error: any) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

export const editPackageDto = {
  body: updatePackageDto,
} satisfies commonDto;

export const editPackage = async (req: Request, res: Response) => {
    try {
        const { id } = (req.params);
        if (!Number(id)){
            return res.status(400).json({ status: 400, message: "ID must be Number" })  
        }
        const data = req.body;
        const result = await PackageService.editPackage(Number(id), data)
        res.json({ status: 200, message: "Package Updated", data: result })
    } catch (error: any) {
        res.status(500).json({ status: 500, message: error.message })

    }
}

export const deletePackage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await PackageService.deletePackage(Number(id));
        res.json({ status:200, message: "Packeage Deleted" })
    } catch (error: any) {
        res.status(500).json({ status: 500, message: error.message })
    }
}