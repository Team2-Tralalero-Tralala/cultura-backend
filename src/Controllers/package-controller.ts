import type { Request, Response } from "express";
import * as PackageService from "../Services/package/package-service.js";

export const createPackage = async (req: Request, res: Response) => {
    try {
        const result = await PackageService.createPackage(req.body);
    } catch (error: any) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

export const getPackageByMemberID = async (req: Request, res: Response) => {
    try {
        const { memberId } = req.params;
        if (!memberId) {
            return res.status(400).json({ status: 400, message: "memberID is require" })
        }
        const result = await PackageService.getPackageByMemberID(Number(memberId));
        res.json({ status: 200, data: result});
    } catch (error: any) {
        res.status(500).json({ status: 500, message: error.message });
    }
};