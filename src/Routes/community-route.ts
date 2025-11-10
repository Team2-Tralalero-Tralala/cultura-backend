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
 * คำอธิบาย : ใช้สำหรับสร้างข้อมูลชุมชนใหม่ พร้อมแนบไฟล์รูปภาพหรือวิดีโอได้หลายประเภท
 */
/**
 * @swagger
 * /api/super/community:
 *   post:
 *     summary: สร้างข้อมูลชุมชนใหม่ (เฉพาะ Superadmin)
 *     description: ใช้สำหรับสร้างข้อมูลชุมชนใหม่ พร้อมอัปโหลดไฟล์รูปภาพได้หลายประเภท เช่น โลโก้, รูปปก, แกลเลอรี่ และวิดีโอ
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - registerNumber
 *               - registerDate
 *               - description
 *               - mainActivityName
 *               - mainActivityDescription
 *               - status
 *               - bankName
 *               - accountName
 *               - accountNumber
 *             properties:
 *               name:
 *                 type: string
 *                 example: "บ้านหนองน้ำใสคิคิ"
 *               alias:
 *                 type: string
 *                 example: "หนองน้ำใส"
 *               type:
 *                 type: string
 *                 example: "การท่องเที่ยวเชิงเกษตร"
 *               registerNumber:
 *                 type: string
 *                 example: "CN001-2025"
 *               registerDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-15T00:00:00.000Z"
 *               description:
 *                 type: string
 *                 example: "ชุมชนเกษตรอินทรีย์และการท่องเที่ยวเชิงเรียนรู้"
 *               mainActivityName:
 *                 type: string
 *                 example: "โฮมสเตย์ + ฟาร์มเกษตร"
 *               mainActivityDescription:
 *                 type: string
 *                 example: "ให้นักท่องเที่ยวได้เรียนรู้และพักผ่อนในฟาร์มเกษตร"
 *               phone:
 *                 type: string
 *                 example: "0812345678"
 *               email:
 *                 type: string
 *                 example: "nongnamsai@cultura.com"
 *               bankName:
 *                 type: string
 *                 example: "ธนาคารกสิกรไทย"
 *               accountName:
 *                 type: string
 *                 example: "นายกมล ทองแท้"
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               location[houseNumber]:
 *                 type: string
 *                 example: "123"
 *               location[subDistrict]:
 *                 type: string
 *                 example: "บ้านเหนือ"
 *               location[district]:
 *                 type: string
 *                 example: "เมือง"
 *               location[province]:
 *                 type: string
 *                 example: "เชียงราย"
 *               location[postalCode]:
 *                 type: string
 *                 example: "57000"
 *               location[latitude]:
 *                 type: number
 *                 example: 19.9074
 *               location[longitude]:
 *                 type: number
 *                 example: 99.8325
 *               tagCommunities:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์รูปโลโก้
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์รูปหน้าปก
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: รูปภาพแกลเลอรี่ (อัปโหลดได้หลายไฟล์)
 *               video:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: วิดีโอของชุมชน (อัปโหลดได้หลายไฟล์)
 *     responses:
 *       200:
 *         description: สร้างชุมชนสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: "create community successfully"
 *               data:
 *                 id: 1
 *                 name: "บ้านหนองน้ำใสคิคิ"
 *                 alias: "หนองน้ำใส"
 *                 type: "การท่องเที่ยวเชิงเกษตร"
 *                 registerNumber: "CN001-2025"
 *                 registerDate: "2025-01-15T00:00:00.000Z"
 *                 description: "ชุมชนเกษตรอินทรีย์และการท่องเที่ยวเชิงเรียนรู้"
 *                 mainActivityName: "โฮมสเตย์ + ฟาร์มเกษตร"
 *                 mainActivityDescription: "ให้นักท่องเที่ยวได้เรียนรู้และพักผ่อนในฟาร์มเกษตร"
 *                 bankName: "ธนาคารกสิกรไทย"
 *                 accountName: "นายกมล ทองแท้"
 *                 accountNumber: "1234567890"
 *                 phone: "0812345678"
 *                 email: "nongnamsai@cultura.com"
 *                 status: "OPEN"
 *                 location:
 *                   id: 10
 *                   houseNumber: "123"
 *                   subDistrict: "บ้านเหนือ"
 *                   district: "เมือง"
 *                   province: "เชียงราย"
 *                   postalCode: "57000"
 *                   latitude: 19.9074
 *                   longitude: 99.8325
 *                 communityImage:
 *                   - type: "LOGO"
 *                     image: "/uploads/logo.jpg"
 *                   - type: "COVER"
 *                     image: "/uploads/cover.jpg"
 *                   - type: "GALLERY"
 *                     image: "/uploads/gallery1.jpg"
 *                   - type: "VIDEO"
 *                     image: "/uploads/video1.mp4"
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "ข้อมูลไม่ถูกต้อง หรือมีชุมชนนี้อยู่แล้ว"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 */
communityRoutes.post(
  "/super/community",
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
 * คำอธิบาย : ใช้สำหรับอัปเดตข้อมูลของชุมชน รวมถึงการเปลี่ยนรูปหรือวิดีโอ
 */
/**
 * @swagger
 * /api/super/community/{communityId}:
 *   put:
 *     summary: แก้ไขข้อมูลชุมชน (เฉพาะ Superadmin)
 *     description: ใช้สำหรับแก้ไขข้อมูลชุมชน พร้อมอัปโหลดไฟล์รูปภาพหรือวิดีโอใหม่ (เช่น โลโก้, ปก, แกลเลอรี่, วิดีโอ)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของชุมชนที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "บ้านหนองน้ำใสคิคิ"
 *               alias:
 *                 type: string
 *                 example: "หนองน้ำใส"
 *               type:
 *                 type: string
 *                 example: "การท่องเที่ยวเชิงเกษตร"
 *               registerNumber:
 *                 type: string
 *                 example: "CN001-2025"
 *               registerDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-15T00:00:00.000Z"
 *               description:
 *                 type: string
 *                 example: "ชุมชนเกษตรอินทรีย์และการท่องเที่ยวเชิงเรียนรู้"
 *               mainActivityName:
 *                 type: string
 *                 example: "โฮมสเตย์ + ฟาร์มเกษตร"
 *               mainActivityDescription:
 *                 type: string
 *                 example: "ให้นักท่องเที่ยวได้เรียนรู้และพักผ่อนในฟาร์มเกษตร"
 *               phone:
 *                 type: string
 *                 example: "0812345678"
 *               email:
 *                 type: string
 *                 example: "nongnamsai@cultura.com"
 *               bankName:
 *                 type: string
 *                 example: "ธนาคารกสิกรไทย"
 *               accountName:
 *                 type: string
 *                 example: "นายกมล ทองแท้"
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED]
 *                 example: "OPEN"
 *               location[houseNumber]:
 *                 type: string
 *                 example: "123"
 *               location[subDistrict]:
 *                 type: string
 *                 example: "บ้านเหนือ"
 *               location[district]:
 *                 type: string
 *                 example: "เมือง"
 *               location[province]:
 *                 type: string
 *                 example: "เชียงราย"
 *               location[postalCode]:
 *                 type: string
 *                 example: "57000"
 *               location[latitude]:
 *                 type: number
 *                 example: 19.9074
 *               location[longitude]:
 *                 type: number
 *                 example: 99.8325
 *               tagCommunities:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: รูปโลโก้ใหม่ (ถ้ามี)
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: รูปหน้าปกใหม่ (ถ้ามี)
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: รูปแกลเลอรี่ใหม่ (สามารถอัปโหลดได้หลายรูป)
 *               video:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: วิดีโอใหม่ของชุมชน (อัปโหลดได้หลายไฟล์)
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลชุมชนสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: "update community successfully"
 *               data:
 *                 id: 1
 *                 name: "บ้านหนองน้ำใสคิคิ"
 *                 alias: "หนองน้ำใส"
 *                 type: "การท่องเที่ยวเชิงเกษตร"
 *                 registerNumber: "CN001-2025"
 *                 registerDate: "2025-01-15T00:00:00.000Z"
 *                 description: "ชุมชนเกษตรอินทรีย์และการท่องเที่ยวเชิงเรียนรู้"
 *                 mainActivityName: "โฮมสเตย์ + ฟาร์มเกษตร"
 *                 mainActivityDescription: "ให้นักท่องเที่ยวได้เรียนรู้และพักผ่อนในฟาร์มเกษตร"
 *                 bankName: "ธนาคารกสิกรไทย"
 *                 accountName: "นายกมล ทองแท้"
 *                 accountNumber: "1234567890"
 *                 phone: "0812345678"
 *                 email: "nongnamsai@cultura.com"
 *                 status: "OPEN"
 *                 location:
 *                   id: 10
 *                   houseNumber: "123"
 *                   subDistrict: "บ้านเหนือ"
 *                   district: "เมือง"
 *                   province: "เชียงราย"
 *                   postalCode: "57000"
 *                   latitude: 19.9074
 *                   longitude: 99.8325
 *                 communityImage:
 *                   - type: "LOGO"
 *                     image: "/uploads/logo.jpg"
 *                   - type: "COVER"
 *                     image: "/uploads/cover.jpg"
 *                   - type: "GALLERY"
 *                     image: "/uploads/gallery1.jpg"
 *                   - type: "VIDEO"
 *                     image: "/uploads/video1.mp4"
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือไม่พบชุมชนที่ต้องการแก้ไข
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "ไม่พบชุมชนหรือข้อมูลไม่ถูกต้อง"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (token ไม่ถูกต้องหรือหมดอายุ)
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 */
communityRoutes.put(
  "/super/community/:communityId",
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
 * คำอธิบาย : ใช้สำหรับลบข้อมูลชุมชนแบบ Soft Delete (เปลี่ยนสถานะไม่ใช่ลบจริง)
 */
/**
 * @swagger
 * /api/super/community/{communityId}:
 *   patch:
 *     summary: ลบข้อมูลชุมชน (เฉพาะ Superadmin)
 *     description: ใช้สำหรับลบข้อมูลชุมชนแบบ soft delete โดยจะไม่ลบข้อมูลจริงออกจากฐานข้อมูล แต่จะเปลี่ยนสถานะ `isDeleted` เป็น `true` และเพิ่มเวลาในฟิลด์ `deleteAt`
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของชุมชนที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลชุมชนสำเร็จ (soft delete)
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: "Deleted community successfully"
 *               data:
 *                 id: 1
 *                 locationId: 1
 *                 adminId: 2
 *                 name: "Green Village"
 *                 alias: null
 *                 type: "Tourism"
 *                 registerNumber: "REG001"
 *                 registerDate: "2020-01-01T00:00:00.000Z"
 *                 description: "Eco community"
 *                 bankName: "Bangkok Bank"
 *                 accountName: "Admin One"
 *                 accountNumber: "1234567890"
 *                 mainActivityName: "Farming"
 *                 mainActivityDescription: "Organic rice"
 *                 status: "CLOSED"
 *                 phone: "0901111111"
 *                 rating: 4.5
 *                 email: "green@village.com"
 *                 mainAdmin: "Admin One"
 *                 mainAdminPhone: "0901111111"
 *                 coordinatorName: null
 *                 coordinatorPhone: null
 *                 urlWebsite: null
 *                 urlFacebook: null
 *                 urlLine: null
 *                 urlTiktok: null
 *                 urlOther: null
 *                 isDeleted: true
 *                 deleteAt: "2025-11-10T17:25:45.000Z"
 *       400:
 *         description: ไม่พบชุมชนที่ต้องการลบ หรือข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "ไม่พบข้อมูลชุมชนที่ต้องการลบ"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (token ไม่ถูกต้องหรือหมดอายุ)
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 */

communityRoutes.patch(
  "/super/community/:communityId",
  validateDto(CommunityController.deleteCommunityByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.deleteCommunityById
);
/*
 * คำอธิบาย : ใช้สำหรับดึงข้อมูลของชุมชนตาม ID
 */
/**
 * @swagger
 * /api/super/community/{communityId}:
 *   get:
 *     summary: ดึงข้อมูลชุมชนตามรหัส (เฉพาะ Superadmin)
 *     description: ใช้สำหรับดึงข้อมูลรายละเอียดของชุมชน รวมถึงที่อยู่ รูปภาพ ผู้ดูแล และสมาชิกในชุมชนนั้น ๆ
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของชุมชนที่ต้องการดึงข้อมูล
 *     responses:
 *       200:
 *         description: ดึงข้อมูลชุมชนสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: get community successfully
 *               data:
 *                 id: 1
 *                 locationId: 1
 *                 adminId: 2
 *                 name: "Green Village"
 *                 alias: null
 *                 type: "Tourism"
 *                 registerNumber: "REG001"
 *                 registerDate: "2020-01-01T00:00:00.000Z"
 *                 description: "Eco community"
 *                 bankName: "Bangkok Bank"
 *                 accountName: "Admin One"
 *                 accountNumber: "1234567890"
 *                 mainActivityName: "Farming"
 *                 mainActivityDescription: "Organic rice"
 *                 status: "CLOSED"
 *                 phone: "0901111111"
 *                 rating: 4.5
 *                 email: "green@village.com"
 *                 mainAdmin: "Admin One"
 *                 mainAdminPhone: "0901111111"
 *                 coordinatorName: null
 *                 coordinatorPhone: null
 *                 urlWebsite: null
 *                 urlFacebook: null
 *                 urlLine: null
 *                 urlTiktok: null
 *                 urlOther: null
 *                 isDeleted: false
 *                 deleteAt: null
 *                 location:
 *                   id: 1
 *                   detail: null
 *                   houseNumber: "123"
 *                   villageNumber: null
 *                   alley: null
 *                   subDistrict: "บ้านเหนือ"
 *                   district: "เมือง"
 *                   province: "เชียงราย"
 *                   postalCode: "57000"
 *                   latitude: 19.9074
 *                   longitude: 99.8325
 *                 communityImage:
 *                   - id: 1
 *                     communityId: 1
 *                     image: "/community1.jpg"
 *                     type: "LOGO"
 *                 admin:
 *                   id: 2
 *                   fname: "Admin"
 *                   lname: "One"
 *                 communityMembers:
 *                   - id: 1
 *                     communityId: 1
 *                     memberId: 7
 *                     user:
 *                       id: 7
 *                       fname: "Member"
 *                       lname: "One"
 *       400:
 *         description: ค่าพารามิเตอร์ไม่ถูกต้อง หรือไม่พบข้อมูลชุมชน
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "ไม่พบข้อมูลชุมชน"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (token ไม่ถูกต้องหรือหมดอายุ)
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 */

communityRoutes.get(
  "/super/community/:communityId",
  validateDto(CommunityController.getCommunityByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getCommunityById
);

/*
 * คำอธิบาย : ดึงรายชื่อผู้ดูแล (Admin) ที่ยังไม่ถูกมอบหมายกับชุมชน
 */
/**
 * @swagger
 * /api/super/admins/unassigned:
 *   get:
 *     summary: ดึงรายชื่อผู้ดูแลระบบ (Admin) ที่ยังไม่ถูกกำหนดให้กับชุมชน
 *     description: ใช้สำหรับดึงข้อมูลรายชื่อของผู้ดูแลระบบ (Admin) ที่ยังไม่ได้ถูกเชื่อมโยงกับชุมชนใด โดยสามารถใช้งานได้ทั้ง Superadmin และ Admin
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงรายชื่อผู้ดูแลระบบที่ยังไม่ได้ถูกกำหนดสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: "fetch admin successfully"
 *               data:
 *                 - id: 9
 *                   fname: "John"
 *                   lname: "Doe"
 *                 - id: 7
 *                   fname: "Member"
 *                   lname: "One"
 *                 - id: 8
 *                   fname: "Member"
 *                   lname: "Two"
 *       400:
 *         description: ค่าพารามิเตอร์ไม่ถูกต้อง หรือไม่สามารถดึงข้อมูลได้
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "ไม่สามารถดึงข้อมูลผู้ดูแลได้"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (token ไม่ถูกต้องหรือหมดอายุ)
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 */
communityRoutes.get(
  "/super/admins/unassigned",
  validateDto(CommunityController.unassignedAdminsDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  CommunityController.getUnassignedAdmins
);
/*
 * คำอธิบาย : ดึงรายชื่อสมาชิก (Member) ที่ยังไม่ถูกมอบหมายกับชุมชน
 */
/**
 * @swagger
 * /api/super/members/unassigned:
 *   get:
 *     summary: ดึงรายชื่อสมาชิก (Member) ที่ยังไม่ถูกกำหนดให้กับชุมชน
 *     description: ใช้สำหรับดึงข้อมูลรายชื่อของสมาชิก (Member) ที่ยังไม่ได้เชื่อมโยงกับชุมชนใด โดยสามารถเข้าถึงได้ทั้ง Superadmin และ Admin
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงรายชื่อสมาชิกที่ยังไม่ได้ถูกกำหนดสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: "fetch member successfully"
 *               data:
 *                 - id: 9
 *                   fname: "John"
 *                   lname: "Doe"
 *                 - id: 7
 *                   fname: "Member"
 *                   lname: "One"
 *                 - id: 8
 *                   fname: "Member"
 *                   lname: "Two"
 *       400:
 *         description: ค่าพารามิเตอร์ไม่ถูกต้อง หรือไม่สามารถดึงข้อมูลได้
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "ไม่สามารถดึงข้อมูลสมาชิกได้"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (token ไม่ถูกต้องหรือหมดอายุ)
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 */
communityRoutes.get(
  "/super/members/unassigned",
  validateDto(CommunityController.unassignedMemberDto),
  authMiddleware,
  allowRoles("superadmin", "admin"),
  CommunityController.getUnassignedMembers
);
/*
 * คำอธิบาย : ใช้สำหรับดึงข้อมูลรายละเอียดของชุมชนที่ผู้ดูแล (Admin) รับผิดชอบอยู่
 */
/**
 * @swagger
 * /api/admin/community:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดชุมชนของผู้ดูแล (Admin)
 *     description: ใช้สำหรับดึงข้อมูลรายละเอียดของชุมชนที่ผู้ดูแล (Admin) เป็นเจ้าของ รวมถึงข้อมูลที่อยู่ รูปภาพ และสมาชิกภายในชุมชน
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลรายละเอียดชุมชนสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: "get community successfully"
 *               data:
 *                 id: 1
 *                 name: "Green Village"
 *                 alias: null
 *                 type: "การท่องเที่ยวเชิงเกษตร"
 *                 registerNumber: "CN001-2025"
 *                 registerDate: "2025-01-15T00:00:00.000Z"
 *                 description: "ชุมชนเกษตรอินทรีย์และการท่องเที่ยวเชิงเรียนรู้"
 *                 bankName: "ธนาคารกสิกรไทย"
 *                 accountName: "นายกมล ทองแท้"
 *                 accountNumber: "1234567890"
 *                 mainActivityName: "โฮมสเตย์ + ฟาร์มเกษตร"
 *                 mainActivityDescription: "ให้นักท่องเที่ยวได้เรียนรู้และพักผ่อนในฟาร์มเกษตร"
 *                 status: "OPEN"
 *                 phone: "0812345678"
 *                 rating: 4.8
 *                 email: "green@village.com"
 *                 mainAdmin: "Admin One"
 *                 mainAdminPhone: "0812345678"
 *                 coordinatorName: "สมชาย ประเสริฐ"
 *                 coordinatorPhone: "0897654321"
 *                 urlWebsite: "https://green-village.com"
 *                 urlFacebook: "https://facebook.com/greenvillage"
 *                 urlLine: "@greenvillage"
 *                 urlTiktok: "https://tiktok.com/@greenvillage"
 *                 urlOther: null
 *                 location:
 *                   id: 10
 *                   houseNumber: "123"
 *                   subDistrict: "บ้านเหนือ"
 *                   district: "เมือง"
 *                   province: "เชียงราย"
 *                   postalCode: "57000"
 *                   latitude: 19.9074
 *                   longitude: 99.8325
 *                 communityImage:
 *                   - id: 1
 *                     type: "LOGO"
 *                     image: "/uploads/logo.jpg"
 *                   - id: 2
 *                     type: "COVER"
 *                     image: "/uploads/cover.jpg"
 *                   - id: 3
 *                     type: "GALLERY"
 *                     image: "/uploads/gallery1.jpg"
 *                   - id: 4
 *                     type: "VIDEO"
 *                     image: "/uploads/video1.mp4"
 *                 communityMembers:
 *                   - id: 1
 *                     memberId: 7
 *                     user:
 *                       id: 7
 *                       fname: "Member"
 *                       lname: "One"
 *                   - id: 2
 *                     memberId: 8
 *                     user:
 *                       id: 8
 *                       fname: "Member"
 *                       lname: "Two"
 *       400:
 *         description: ไม่พบข้อมูลชุมชนของผู้ดูแล หรือข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "ไม่พบข้อมูลชุมชนของผู้ดูแล"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (token ไม่ถูกต้องหรือหมดอายุ)
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 */
communityRoutes.get(
  "/admin/community",
  validateDto(CommunityController.getCommunityDetailByAdminDto),
  authMiddleware,
  allowRoles("admin"),
  CommunityController.getCommunityDetailByAdmin
);
/*
 * คำอธิบาย : ดึงรายชื่อชุมชนทั้งหมด (พร้อมข้อมูลพื้นฐาน)
 */
communityRoutes.get(
  "/super/communities",
  validateDto(CommunityController.getCommunityAllDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getCommunityAll
);

/*
 * คำอธิบาย : ดึงข้อมูลรายละเอียดเชิงลึกของชุมชนตาม ID
 */
communityRoutes.get(
  "/super/community/detail/:communityId",
  validateDto(CommunityController.getCommunityDetailByIdDto),
  authMiddleware,
  allowRoles("superadmin"),
  CommunityController.getCommunityDetailById
);
/*
 * คำอธิบาย : ใช้สำหรับดึงข้อมูลรายละเอียดของชุมชนที่ผู้ดูแล (Admin) รับผิดชอบอยู่
 */
communityRoutes.get(
  "/admin/community/own",
  validateDto(CommunityController.getCommunityOwnDto),
  authMiddleware,
  allowRoles("admin"),
  CommunityController.getCommunityOwn
);
/*
 * คำอธิบาย : ใช้สำหรับอัปเดตข้อมูลของชุมชน
 */
/**
 * @swagger
 * /api/admin/community/own:
 *   put:
 *     summary: แก้ไขข้อมูลชุมชนของตนเอง (เฉพาะ Admin)
 *     description: ใช้สำหรับแก้ไขข้อมูลชุมชนของผู้ดูแล (Admin) พร้อมอัปโหลดรูปภาพและวิดีโอ เช่น โลโก้, ปก, แกลเลอรี่, และวิดีโอ
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "บ้านหนองน้ำใสคิคิ"
 *               alias:
 *                 type: string
 *                 example: "หนองน้ำใส"
 *               type:
 *                 type: string
 *                 example: "การท่องเที่ยวเชิงเกษตร"
 *               registerNumber:
 *                 type: string
 *                 example: "CN001-2025"
 *               registerDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-15T00:00:00.000Z"
 *               description:
 *                 type: string
 *                 example: "ชุมชนเกษตรอินทรีย์และการท่องเที่ยวเชิงเรียนรู้"
 *               mainActivityName:
 *                 type: string
 *                 example: "โฮมสเตย์ + ฟาร์มเกษตร"
 *               mainActivityDescription:
 *                 type: string
 *                 example: "ให้นักท่องเที่ยวได้เรียนรู้และพักผ่อนในฟาร์มเกษตร"
 *               bankName:
 *                 type: string
 *                 example: "ธนาคารกสิกรไทย"
 *               accountName:
 *                 type: string
 *                 example: "นายกมล ทองแท้"
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               phone:
 *                 type: string
 *                 example: "0812345678"
 *               email:
 *                 type: string
 *                 example: "nongnamsai@cultura.com"
 *               location[houseNumber]:
 *                 type: string
 *                 example: "123"
 *               location[subDistrict]:
 *                 type: string
 *                 example: "บ้านเหนือ"
 *               location[district]:
 *                 type: string
 *                 example: "เมือง"
 *               location[province]:
 *                 type: string
 *                 example: "เชียงราย"
 *               location[postalCode]:
 *                 type: string
 *                 example: "57000"
 *               location[latitude]:
 *                 type: number
 *                 example: 19.9074
 *               location[longitude]:
 *                 type: number
 *                 example: 99.8325
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: รูปโลโก้ของชุมชน
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: รูปหน้าปกของชุมชน
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: รูปแกลเลอรี่ของชุมชน
 *               video:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: วิดีโอของชุมชน
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลชุมชนสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               error: false
 *               message: "update community successfully"
 *               data:
 *                 id: 1
 *                 name: "บ้านหนองน้ำใสคิคิ"
 *                 alias: "หนองน้ำใส"
 *                 type: "การท่องเที่ยวเชิงเกษตร"
 *                 registerNumber: "CN001-2025"
 *                 registerDate: "2025-01-15T00:00:00.000Z"
 *                 description: "ชุมชนเกษตรอินทรีย์และการท่องเที่ยวเชิงเรียนรู้"
 *                 mainActivityName: "โฮมสเตย์ + ฟาร์มเกษตร"
 *                 mainActivityDescription: "ให้นักท่องเที่ยวได้เรียนรู้และพักผ่อนในฟาร์มเกษตร"
 *                 bankName: "ธนาคารกสิกรไทย"
 *                 accountName: "นายกมล ทองแท้"
 *                 accountNumber: "1234567890"
 *                 phone: "0812345678"
 *                 email: "nongnamsai@cultura.com"
 *                 status: "OPEN"
 *                 location:
 *                   id: 10
 *                   houseNumber: "123"
 *                   subDistrict: "บ้านเหนือ"
 *                   district: "เมือง"
 *                   province: "เชียงราย"
 *                   postalCode: "57000"
 *                   latitude: 19.9074
 *                   longitude: 99.8325
 *                 communityImage:
 *                   - type: "LOGO"
 *                     image: "/uploads/logo.jpg"
 *                   - type: "COVER"
 *                     image: "/uploads/cover.jpg"
 *                   - type: "GALLERY"
 *                     image: "/uploads/gallery1.jpg"
 *                   - type: "VIDEO"
 *                     image: "/uploads/video1.mp4"
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือไม่พบชุมชนของผู้ดูแล
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               error: true
 *               message: "ไม่พบข้อมูลชุมชนหรือข้อมูลไม่ถูกต้อง"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (token ไม่ถูกต้องหรือหมดอายุ)
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: true
 *               message: "Unauthorized"
 */
communityRoutes.put(
  "/admin/community/own",
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
