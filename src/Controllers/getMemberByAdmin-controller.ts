// src/Controllers/admin-members.controller.ts
import type { Request, Response } from "express";
import { getMemberByAdmin as getMemberByAdminSvc } from "../Services/getMemberByAdmin.js";

/** GET /api/admin/members */
export const getMemberByAdmin = async (_req: Request, res: Response) => {
  try {
    const items = await getMemberByAdminSvc();
    return res.status(200).json(items); // => [ { username, roleName, email }, ... ]
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
