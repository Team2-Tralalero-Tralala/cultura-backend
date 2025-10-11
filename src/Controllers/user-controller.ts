import type { Request, Response } from "express";
import prisma from "../Services/database-service.js"

export const getAllUSers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id:true, fname: true, lname: true, role: true , memberOfCommunity:true , email: true,},
        });
        res.status(201).json(users)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users"})
    }
};