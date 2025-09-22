import type { Request, Response } from "express";
import * as PackageService from "../Services/package-service.js";

export const createPackage = async (req: Request, res: Response) => {
    try {
        const result = await PackageService.createPackage(req.body);
    } catch (error: any) {
        res.status(500).json({ status: 500, message: error.message });
    }
};