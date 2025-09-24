import type { Request, Response } from "express";
import * as CommunityService from "../Services/community-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";


export const getCommunityId = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id ?? "0", 10);
    if (isNaN(id)) {
        return createErrorResponse(res, 400, "Invalid community id");
    }
    try {
        const community = await CommunityService.getCommunityById(id);
        return createResponse(res, 200, "Community getById successfully", community);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

// export const getById = async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.communityId);
//     const full = req.query.full === "1"; // ใช้ /communities/1?full=1

//     if (Number.isNaN(id)) {
//       return res.status(400).json({ status: 400, message: "communityId ต้องเป็นตัวเลข" });
//     }

//     const data = full
//       ? await CommunityService.getCommunityByIdFull(id)
//       : await CommunityService.getCommunityById(id);

//     if (!data) {
//       return res.status(404).json({ status: 404, message: "ไม่พบชุมชน" });
//     }

//     return res.status(200).json({ status: 200, data });
//   } catch (e: any) {
//     return res.status(500).json({ status: 500, message: e.message });
//   }
// };
