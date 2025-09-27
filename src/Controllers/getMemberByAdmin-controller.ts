// src/Controllers/getMemberByAdmin-controller.ts
import type { Request, Response } from "express";
import { getMemberByAdmin as getMemberByAdminSvc } from "../Services/getMemberByAdmin.js";

/** GET /api/admin/communities/:communityId/members */
export const getMemberByAdmin = async (req: Request, res: Response) => {
  const communityId = Number(req.params.communityId);
  if (!Number.isFinite(communityId) || communityId <= 0) {
    return res.status(400).json({ message: "Invalid communityId" });
  }

  try {
    const items = await getMemberByAdminSvc(communityId);
    return res.status(200).json(items); // [{ username, roleName, email }, ...]
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
