/*
 * คำอธิบาย : Router สำหรับจัดการเส้นทาง (Route) ของข้อมูลวิสาหกิจชุมชน (Community)
 * ใช้สำหรับเชื่อมโยงเส้นทาง API เข้ากับ Controller ที่เกี่ยวข้องกับการจัดการชุมชน
 * โดยรองรับการทำงานของ SuperAdmin และ Admin
 *
 * ฟังก์ชันหลักที่รองรับ :
 *   - สร้างชุมชนใหม่ (POST /super/community)
 *   - แก้ไขข้อมูลชุมชน (PUT /super/community/:communityId)
 *   - ลบข้อมูลชุมชนแบบ Soft Delete (PATCH /super/community/:communityId)
 *   - ดึงข้อมูลชุมชนตาม ID (GET /super/community/:communityId)
 *   - ดึงรายชื่อผู้ดูแลและสมาชิกที่ยังไม่ถูกผูกกับชุมชน
 *   - ดึงข้อมูลชุมชนทั้งหมด และรายละเอียดชุมชนแบบละเอียด
 *
 * Middleware ที่ใช้ :
 *   - authMiddleware : ตรวจสอบสิทธิ์การเข้าสู่ระบบ
 *   - allowRoles : จำกัดสิทธิ์เฉพาะบทบาทที่กำหนด (เช่น superadmin, admin)
 *   - upload.fields : รองรับการอัปโหลดไฟล์หลายประเภท (logo, cover, gallery, video)
 */

import { Router } from "express";
import * as CommunityController from "~/Controllers/community-controller.js";
import { upload } from "~/Libs/uploadFile.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const communityRoutes = Router();

/*
 * เส้นทาง : POST /super/community
 * คำอธิบาย : ใช้สำหรับสร้างข้อมูลชุมชนใหม่ พร้อมแนบไฟล์รูปภาพหรือวิดีโอได้หลายประเภท
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
communityRoutes.post(
  "/super/community",
  // validateDto(CommunityController.createCommunityDto),
  authMiddleware,
  allowRoles("superadmin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
    { name: "video", maxCount: 5 },
  ]),
  CommunityController.createCommunity
);

/*
 * เส้นทาง : PUT /super/community/:communityId
 * คำอธิบาย : ใช้สำหรับอัปเดตข้อมูลของชุมชน รวมถึงการเปลี่ยนรูปหรือวิดีโอ
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
communityRoutes.put(
  "/super/community/:communityId",
  // validateDto(CommunityController.editCommunityDto),
  authMiddleware,
  allowRoles("superadmin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
    { name: "video", maxCount: 5 },
  ]),
  CommunityController.editCommunity
);

/*
 * เส้นทาง : PATCH /super/community/:communityId
 * คำอธิบาย : ใช้สำหรับลบข้อมูลชุมชนแบบ Soft Delete (เปลี่ยนสถานะไม่ใช่ลบจริง)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
communityRoutes.patch(
  "/super/community/:communityId",
  validateDto(CommunityController.deleteCommunityByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.deleteCommunityById
);
/*
 * เส้นทาง : GET /super/community/:communityId
 * คำอธิบาย : ใช้สำหรับดึงข้อมูลของชุมชนตาม ID
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
communityRoutes.get(
  "/super/community/:communityId",
  validateDto(CommunityController.getCommunityByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getCommunityById
);

/*
 * เส้นทาง : GET /super/admins/unassigned
 * คำอธิบาย : ดึงรายชื่อผู้ดูแล (Admin) ที่ยังไม่ถูกมอบหมายกับชุมชน
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
communityRoutes.get(
  "/super/admins/unassigned",
  validateDto(CommunityController.unassignedAdminsDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  CommunityController.getUnassignedAdmins
);
/*
 * เส้นทาง : GET /super/members/unassigned
 * คำอธิบาย : ดึงรายชื่อสมาชิก (Member) ที่ยังไม่ถูกมอบหมายกับชุมชน
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
communityRoutes.get(
  "/super/members/unassigned",
  validateDto(CommunityController.unassignedMemberDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  CommunityController.getUnassignedMembers
);
/*
 * เส้นทาง : GET /admin/community
 * คำอธิบาย : ใช้สำหรับดึงข้อมูลรายละเอียดของชุมชนที่ผู้ดูแล (Admin) รับผิดชอบอยู่
 * สิทธิ์ที่เข้าถึงได้ : Admin
 */
communityRoutes.get(
  "/admin/community",
  validateDto(CommunityController.getCommunityDetailByAdminDto),
  authMiddleware,
  allowRoles("admin"),
  CommunityController.getCommunityDetailByAdmin
);
/*
 * เส้นทาง : GET /super/communities
 * คำอธิบาย : ดึงรายชื่อชุมชนทั้งหมด (พร้อมข้อมูลพื้นฐาน)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
communityRoutes.get(
  "/super/communities",
  validateDto(CommunityController.getCommunityAllDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getCommunityAll
);

/*
 * เส้นทาง : GET /super/community/detail/:communityId
 * คำอธิบาย : ดึงข้อมูลรายละเอียดเชิงลึกของชุมชนตาม ID
 * ใช้สำหรับดูข้อมูลพร้อมความสัมพันธ์ (location, members, images)
 * สิทธิ์ที่เข้าถึงได้ : SuperAdmin
 */
communityRoutes.get(
  "/super/community/detail/:communityId",
  validateDto(CommunityController.getCommunityDetailByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getCommunityDetailById
);
/*
 * เส้นทาง : GET /admin/community
 * คำอธิบาย : ใช้สำหรับดึงข้อมูลรายละเอียดของชุมชนที่ผู้ดูแล (Admin) รับผิดชอบอยู่
 * สิทธิ์ที่เข้าถึงได้ : Admin
 */
communityRoutes.get(
  "/admin/community/own",
  validateDto(CommunityController.getCommunityOwnDto),
  authMiddleware,
  allowRoles("admin"),
  CommunityController.getCommunityOwn
);
/*
 * เส้นทาง : PUT /admin/community/:communityId
 * คำอธิบาย : ใช้สำหรับอัปเดตข้อมูลของชุมชน รวมถึงการเปลี่ยนรูปหรือวิดีโอ
 * สิทธิ์ที่เข้าถึงได้ : admin
 */
communityRoutes.put(
  "/admin/community/own",
  // validateDto(CommunityController.editCommunityDto),
  authMiddleware,
  allowRoles("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
    { name: "video", maxCount: 5 },
  ]),
  CommunityController.editCommunityByAdmin
);
export default communityRoutes;
