import type { Request, Response } from "express";
import * as PackageService from "../Services/package-service.js";
import prisma from "~/Services/database-service.js";


export const createPackage = async (req: Request, res: Response) => {
    try {
        const result = await PackageService.createPackage(req.body);
        res.json({ status:200, data: result })
    } catch (error: any) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

export const getPackageByRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 400, message: "memberID is require" })
        }
        const result = await PackageService.getPackageByRole(Number(id));
        // console.log(result);
        res.json({ status: 200, data: result });
        /* ********************************************************** */
        /* ไม่แน่ใจว่าต้องรอดึงของ getUserRole ของฝั่ง User ไหม */
        const user = await prisma.user.findUnique({
            where: { id: Number(id) }
        })





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

export const editPackage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
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