import type { Request, Response, NextFunction } from "express";
import { listCommunityMembers } from "../Services/admin-members.service.js";

/** GET /api/admin/communities/:communityId/members */
export async function getCommunityMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const communityId = Number(req.params.communityId);
    if (!Number.isFinite(communityId) || communityId <= 0) {
      return res.status(400).json({ ok: false, error: "invalid communityId" });
    }

    const skip = Number(req.query.skip ?? 0);
    const take = Number(req.query.take ?? 10);
    const search = typeof req.query.search === "string" ? req.query.search : "";

    const { items, total } = await listCommunityMembers(communityId, {
      skip,
      take,
      search,
    });

    return res.status(200).json({ ok: true, data: items, meta: { total, skip, take } });
  } catch (e) {
    return next(e);
  }
}
