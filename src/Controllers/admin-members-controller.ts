import type { Request, Response } from "express";
import { createErrorResponse, createResponse } from "../Libs/createResponse.js";
import { validateDto } from "../Libs/validateDto.js";
import * as CommunityService from "../Services/admin-members-service.js";
import * as AccountService from "../Services/account-service.js";

export const getMemberByAdmin = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user.id);

    const result = await CommunityService.getMemberByAdmin(userId);

    return createResponse(res, 200, "Community members retrieved successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};



// // ✅ DTO อยู่ใน Services ตามที่โชว์ในรูป
// import { MembersQueryDto } from "../Services/admin-members.dto.js"

// // ✅ service ใหม่ที่เราเพิ่งเขียน (ดึงตาม admin)
// import * as CommunityService from "../Services/admin-members-service.js";

// export const getCommunityMembers = async (req: Request, res: Response) => {
//   try {
//     const id = req.user.id; // สมมติว่า req.user มี id อยู่แล้ว
    
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;

//     // ❌ เดิม: const result = await getCommunityMembers(Number(id), page, limit);
//     // ✅ แก้ให้เรียก service ที่ import มาแทน
//     const result = await CommunityService.getMemberByAdmin(Number(id), page, limit);

//     return res.status(200).json({
//       status: 200,
//       message: "Get Members Success",
//       result
//     });
//   } catch (error: any) {
//     return res.status(404).json({
//       status: 404,
//       message: error.message
//     });
//   }
// };
