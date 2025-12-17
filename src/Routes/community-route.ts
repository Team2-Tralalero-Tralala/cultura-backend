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
 * คำอธิบาย : ดึงรายชื่อชุมชนทั้งหมด (พร้อมข้อมูลพื้นฐาน)
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
 * คำอธิบาย : ดึงข้อมูลรายละเอียดเชิงลึกของชุมชนตาม ID
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

/**
 * @swagger
 * /api/member/community:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดของชุมชนที่สมาชิกสังกัดอยู่ (สำหรับ Member)
 *     description: |
 *       ใช้สำหรับดึงข้อมูลชุมชนที่ผู้ใช้ Role: **Member** ปัจจุบันสังกัดอยู่  
 *       ระบบจะตรวจสอบจาก JWT Token (req.user.id) และคืนค่ารายละเอียดชุมชนพร้อมข้อมูลที่เกี่ยวข้อง  
 *       เช่น location, รูปภาพ, รายชื่อสมาชิก, ร้านค้า และที่พักในชุมชน
 *     tags:
 *       - Community (Member)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลรายละเอียดของชุมชนของสมาชิกสำเร็จ
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
 *                   example: Get Community detail member 12 successfully
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
 *                       enum: [OPEN, CLOSED]
 *                       example: "OPEN"
 *                     rating:
 *                       type: number
 *                       example: 4.6
 *                     isRatingVisible:
 *                       type: boolean
 *                       example: true
 *                     location:
 *                       type: object
 *                       properties:
 *                         province:
 *                           type: string
 *                           example: "ชลบุรี"
 *                         district:
 *                           type: string
 *                           example: "เมืองชลบุรี"
 *                         subDistrict:
 *                           type: string
 *                           example: "แสนสุข"
 *                         postalCode:
 *                           type: string
 *                           example: "20130"
 *                         latitude:
 *                           type: number
 *                           example: 13.123456
 *                         longitude:
 *                           type: number
 *                           example: 100.987654
 *                     communityMembers:
 *                       type: array
 *                       description: รายชื่อสมาชิกในชุมชน (เฉพาะข้อมูลพื้นฐานของ user)
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
 *                           email:
 *                             type: string
 *                             example: "kanokporn@example.com"
 *                           roleId:
 *                             type: integer
 *                             example: 3
 *                     stores:
 *                       type: array
 *                       description: รายการร้านค้าในชุมชน
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 10
 *                           name:
 *                             type: string
 *                             example: "ร้านของฝากชุมชนคลองตะเคียน"
 *                           detail:
 *                             type: string
 *                             example: "จำหน่ายของฝากและผลิตภัณฑ์ชุมชน"
 *                           storeImage:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 image:
 *                                   type: string
 *                                   example: "uploads/store/store-001.jpg"
 *                                 type:
 *                                   type: string
 *                                   enum: [LOGO, COVER, GALLERY, VIDEO]
 *                                   example: "COVER"
 *                     homestays:
 *                       type: array
 *                       description: รายการที่พักโฮมสเตย์ในชุมชน
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           name:
 *                             type: string
 *                             example: "โฮมสเตย์คุณยายสมหมาย"
 *                           type:
 *                             type: string
 *                             example: "ห้องพักรวม"
 *                           guestPerRoom:
 *                             type: integer
 *                             example: 4
 *                           totalRoom:
 *                             type: integer
 *                             example: 6
 *                           facility:
 *                             type: string
 *                             example: "เครื่องปรับอากาศ, Wi-Fi, อาหารเช้า"
 *                           homestayImage:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 image:
 *                                   type: string
 *                                   example: "uploads/homestay/ht-001-cover.jpg"
 *                                 type:
 *                                   type: string
 *                                   enum: [LOGO, COVER, GALLERY, VIDEO]
 *                                   example: "GALLERY"
 *                     communityImage:
 *                       type: array
 *                       description: รูปภาพประกอบของชุมชน
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
 *         description: ไม่พบข้อมูลชุมชนของสมาชิก หรือเกิดข้อผิดพลาดขณะประมวลผล
 *       401:
 *         description: ไม่พบ Token หรือ Token ไม่ถูกต้อง
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (เฉพาะ Member)
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

communityRoutes.get(
  "/member/community",
  validateDto(CommunityController.getCommunityDetailByMemberDto),
  authMiddleware,
  allowRoles("member"),
  CommunityController.getCommunityDetailByMember
);

/**
 * @swagger
 * /shared/community/{communityId}:
 *   get:
 *     summary: ดึงรายละเอียดชุมชน (Public)
 *     description: |
 *       ดึงรายละเอียดชุมชนสำหรับหน้า Public (guest / tourist) พร้อมรายการ:
 *       - แพ็กเกจ (packages) แบบแยก pagination
 *       - ที่พัก (homestays) แบบแยก pagination
 *       - ร้านค้า (stores) แบบแยก pagination
 *
 *       **เงื่อนไขข้อมูล**
 *       - ชุมชนต้องมีสถานะ `OPEN` และ `isDeleted = false`
 *       - แพ็กเกจต้อง `PUBLISH` + `APPROVE` และ `isDeleted = false`
 *       - ที่พัก/ร้านค้า ต้อง `isDeleted = false`
 *       - ดึง tag ของ package/homestay/store มาด้วย
 *
 *     tags:
 *       - Shared / Community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสชุมชน (ตัวเลขเท่านั้น)
 *
 *       - in: query
 *         name: packagePage
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: หน้าของรายการแพ็กเกจ
 *       - in: query
 *         name: packageLimit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 8
 *         description: จำนวนแพ็กเกจต่อหน้า
 *
 *       - in: query
 *         name: storePage
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: หน้าของรายการร้านค้า
 *       - in: query
 *         name: storeLimit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 12
 *         description: จำนวนร้านค้าต่อหน้า
 *
 *       - in: query
 *         name: homestayPage
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: หน้าของรายการที่พัก
 *       - in: query
 *         name: homestayLimit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 12
 *         description: จำนวนที่พักต่อหน้า
 *
 *     responses:
 *       200:
 *         description: ดึงรายละเอียดชุมชน (Public) สำเร็จ
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
 *                   example: ดึงรายละเอียดชุมชน (Public) สำเร็จ
 *                 data:
 *                   type: object
 *                   properties:
 *                     community:
 *                       type: object
 *                       description: ข้อมูลชุมชน (รวม location, images, admin, members)
 *                     packages:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage: { type: integer, example: 1 }
 *                             totalPages:  { type: integer, example: 3 }
 *                             totalCount:  { type: integer, example: 24 }
 *                             limit:       { type: integer, example: 8 }
 *                     homestays:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage: { type: integer, example: 1 }
 *                             totalPages:  { type: integer, example: 2 }
 *                             totalCount:  { type: integer, example: 18 }
 *                             limit:       { type: integer, example: 12 }
 *                     stores:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage: { type: integer, example: 1 }
 *                             totalPages:  { type: integer, example: 1 }
 *                             totalCount:  { type: integer, example: 9 }
 *                             limit:       { type: integer, example: 12 }
 *
 *       400:
 *         description: ไม่พบชุมชน หรือข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: ไม่พบชุมชน หรือชุมชนยังไม่เปิดให้เข้าชม
 */

/*
 * คำอธิบาย : ดึงข้อมูลรายละเอียดของชุมชนตาม ID (Guest, Tourist)
 */
communityRoutes.get(
  "/shared/community/:communityId",
  validateDto(CommunityController.getCommunityDetailPublicDto),
  CommunityController.getCommunityDetailPublic
);


export default communityRoutes;