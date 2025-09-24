import type { Request, Response } from "express";
import * as CommunityService from "../Services/community-service.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import prisma from "~/Services/database-service.js";


/* 
ฟังก์ชัน : getCommunityById (Controller)
คำอธิบาย : ดึงข้อมูลชุมชนจากฐานข้อมูลตาม id ที่ผู้ใช้ส่งมา (req.params.id)
Input : 
  - req (Request) : อ็อบเจกต์ request ที่มี parameter id
  - res (Response) : อ็อบเจกต์ response สำหรับส่งข้อมูลกลับไปยัง client
Output : 
  - response JSON ที่มีข้อมูลชุมชน (community object) เมื่อค้นพบ
Error : 
  - 400 (Invalid community id) หาก id ไม่ใช่ตัวเลข
  - 404 (Community not found) หากไม่พบชุมชนในฐานข้อมูล
*/
export const getCommunityById = async (req: Request, res: Response) => {
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

/* 
ฟังก์ชัน : getCommunityByRole (Controller)
คำอธิบาย : ดึงรายการชุมชนตาม "บทบาท (role)" ของผู้ใช้ที่มี id ตรงกับพารามิเตอร์
Input : 
  - req.params.id (number) - id ของผู้ใช้ (users.us_id)
Output : 
  - JSON { status, role, data } 
    - role = user.roleId
    - data = รายการชุมชนที่เข้าถึงได้ตามสิทธิ์
Error : 
  - 400 ถ้า id ไม่ใช่ตัวเลข
  - 404 ถ้าไม่พบผู้ใช้
  - 500 ถ้าเกิดข้อผิดพลาดอื่น ๆ
*/
export const getCommunityByRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ status: 400, message: "ID must be Number" });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        communityMembers: true, // ใช้หา communityIds ที่ผู้ใช้อยู่
      },
    });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    let result: any[] = [];
    let roleName: string = ""; // ข้อความบอก role

    
    switch (user.roleId) {
      
      case 1: {
        // superadmin เห็นทุกชุมชน
        result = await prisma.community.findMany();
        roleName = "Super Admin";
        break;
      }
      case 2: {
        // admin เห็นเฉพาะชุมชนตัวเอง
        const communityIds = (user.communityMembers ?? []).map(cm => cm.communityId);
        if (communityIds.length === 0) {
          result = [];
        } else {
          result = await prisma.community.findMany({
            where: { id: { in: communityIds } },
          });
        }
        roleName = "Admin";
        break;
      }
      default: {
        return res.status(400).json({ status: 400, message: "Invalid user role" });
      }

      case 3: {
        // member: เห็นเฉพาะชุมชนตัวเอง
        // ผ่านตาราง community_members
        /*.map(cm => cm.communityId)
            วนลูปทุกแถวใน communityMembers
            ดึงเฉพาะค่า communityId มาเก็บใน array
            เช่น ถ้า user สังกัด 2 ชุมชน id=5, id=7 → จะได้ communityIds = [5, 7]
        */
        const communityIds = (user.communityMembers ?? []).map(cm => cm.communityId);

        //เช็กว่า user ไม่ได้เป็นสมาชิกชุมชนไหนเลย กำหนด result = []
        if (communityIds.length === 0) {
          result = [];
        } else {
          result = await prisma.community.findMany({
            where: { id: { in: communityIds } }, // ใช้ field id (ct_id ถูก map แล้ว)
          });
        }
        roleName = "Member";
        break;
      }
      case 4: {
        // tourist
        result = [];
        roleName = "Tourist";
        break;
      }
    }

    return res.json({ status: 200, I_am : roleName, role: user.roleId, data: result });
  } catch (error: any) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};


