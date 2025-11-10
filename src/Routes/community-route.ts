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

/**
 * @swagger
 * /api/super/communities:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อชุมชนทั้งหมด (สำหรับ Super Admin)
 *     description: |
 *       ดึงข้อมูลชุมชนทั้งหมดจากระบบ พร้อม pagination และข้อมูลผู้ดูแล (Admin) ของแต่ละชุมชน  
 *       ใช้ได้เฉพาะผู้ใช้ที่มีบทบาท **SuperAdmin**
 *     tags:
 *       - Community (Super Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: หน้าที่ต้องการดึงข้อมูล (ค่าเริ่มต้น 1)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: จำนวนข้อมูลต่อหน้า (ค่าเริ่มต้น 10)
 *     responses:
 *       200:
 *         description: ดึงข้อมูลรายการชุมชนทั้งหมดสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All communities list
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "ชุมชนบ้านโนนสะอาด"
 *                       status:
 *                         type: string
 *                         enum: [PENDING, APPROVED, REJECTED, BLOCKED]
 *                         example: "APPROVED"
 *                       location:
 *                         type: object
 *                         properties:
 *                           province:
 *                             type: string
 *                             example: "ชลบุรี"
 *                       admin:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 12
 *                           fname:
 *                             type: string
 *                             example: "สมชาย"
 *                           lname:
 *                             type: string
 *                             example: "ใจดี"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalCount:
 *                       type: integer
 *                       example: 25
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: การตรวจสอบข้อมูลไม่ผ่าน หรือเกิดข้อผิดพลาดภายในระบบ
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ SuperAdmin)
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */


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

/**
 * @swagger
 * /api/super/community/detail/{communityId}:
 *   get:
 *     summary: ดึงรายละเอียดชุมชนแบบเต็ม (สำหรับ Super Admin)
 *     description: |
 *       ใช้สำหรับดึงข้อมูลรายละเอียดของชุมชนตามรหัส `communityId`  
 *       โดยจะแสดงข้อมูลครบทุกความสัมพันธ์ เช่น พิกัด, สมาชิก, ร้านค้า, ที่พัก, และรูปภาพทั้งหมด  
 *       รองรับเฉพาะผู้ใช้ที่มีสิทธิ์ **SuperAdmin**
 *     tags:
 *       - Community (Super Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: รหัสของชุมชนที่ต้องการดึงข้อมูล
 *     responses:
 *       200:
 *         description: ดึงรายละเอียดของชุมชนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Community detail retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "ชุมชนบ้านโนนสะอาด"
 *                     description:
 *                       type: string
 *                       example: "แหล่งท่องเที่ยวเชิงวัฒนธรรมที่มีเอกลักษณ์เฉพาะตัว"
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, REJECTED, BLOCKED]
 *                       example: "APPROVED"
 *                     location:
 *                       type: object
 *                       properties:
 *                         province:
 *                           type: string
 *                           example: "ชลบุรี"
 *                         district:
 *                           type: string
 *                           example: "บางละมุง"
 *                         latitude:
 *                           type: number
 *                           example: 13.123456
 *                         longitude:
 *                           type: number
 *                           example: 100.987654
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 12
 *                         fname:
 *                           type: string
 *                           example: "สมชาย"
 *                         lname:
 *                           type: string
 *                           example: "ใจดี"
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 22
 *                           fname:
 *                             type: string
 *                             example: "กนกพร"
 *                           lname:
 *                             type: string
 *                             example: "สุขใจ"
 *                     stores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 8
 *                           name:
 *                             type: string
 *                             example: "ร้านของฝากบ้านโนนสะอาด"
 *                     homestays:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 3
 *                           name:
 *                             type: string
 *                             example: "โฮมสเตย์คุณยายสมหมาย"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           image:
 *                             type: string
 *                             example: "uploads/community/cover-001.jpg"
 *                           type:
 *                             type: string
 *                             enum: [LOGO, COVER, GALLERY, VIDEO]
 *                             example: "GALLERY"
 *       400:
 *         description: communityId ไม่ถูกต้อง หรือไม่พบข้อมูลชุมชน
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ SuperAdmin)
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

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

/**
 * @swagger
 * /api/admin/community:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดของชุมชนที่แอดมินรับผิดชอบ (สำหรับ Admin)
 *     description: |
 *       ใช้สำหรับดึงข้อมูลชุมชนที่ผู้ดูแล (Admin) ปัจจุบันดูแลอยู่  
 *       ระบบจะตรวจสอบจาก JWT token และคืนค่ารายละเอียดชุมชนพร้อมข้อมูลที่เกี่ยวข้อง  
 *       เช่น location, รูปภาพ, สมาชิก, ร้านค้า, ที่พัก และแพ็กเกจ
 *     tags:
 *       - Community (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลรายละเอียดของชุมชนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Community detail (admin) retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     name:
 *                       type: string
 *                       example: "ชุมชนบ้านคลองตะเคียน"
 *                     description:
 *                       type: string
 *                       example: "ชุมชนท่องเที่ยวเชิงเกษตรอินทรีย์"
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, REJECTED, BLOCKED]
 *                       example: "APPROVED"
 *                     location:
 *                       type: object
 *                       properties:
 *                         province:
 *                           type: string
 *                           example: "ชลบุรี"
 *                         district:
 *                           type: string
 *                           example: "เมืองชลบุรี"
 *                         latitude:
 *                           type: number
 *                           example: 13.123456
 *                         longitude:
 *                           type: number
 *                           example: 100.987654
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 12
 *                         fname:
 *                           type: string
 *                           example: "สมชาย"
 *                         lname:
 *                           type: string
 *                           example: "ใจดี"
 *                     communityMembers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 22
 *                           fname:
 *                             type: string
 *                             example: "กนกพร"
 *                           lname:
 *                             type: string
 *                             example: "สุขใจ"
 *                     stores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 10
 *                           name:
 *                             type: string
 *                             example: "ร้านของฝากชุมชนคลองตะเคียน"
 *                     homestays:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           name:
 *                             type: string
 *                             example: "โฮมสเตย์คุณยายสมหมาย"
 *                     packages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 7
 *                           name:
 *                             type: string
 *                             example: "แพ็กเกจเที่ยวชมสวนผลไม้"
 *                     communityImage:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           image:
 *                             type: string
 *                             example: "uploads/community/cover-003.jpg"
 *                           type:
 *                             type: string
 *                             enum: [LOGO, COVER, GALLERY, VIDEO]
 *                             example: "COVER"
 *       400:
 *         description: ไม่พบข้อมูลชุมชน หรือเกิดข้อผิดพลาดขณะประมวลผล
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ Admin)
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

/*
 * เส้นทาง : GET /admin/community
 * คำอธิบาย : ใช้สำหรับดึงข้อมูลรายละเอียดของชุมชนที่ผู้ดูแล (Admin) รับผิดชอบอยู่
 * สิทธิ์ที่เข้าถึงได้ : Admin
 */
communityRoutes.get(
  "/admin/community",
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
