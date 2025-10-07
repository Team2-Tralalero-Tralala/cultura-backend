// prisma/seed.ts
import {
  PrismaClient,
  ImageType,
  BookingStatus,
  PackagePublishStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/*
 * ฟังก์ชัน : main
 * คำอธิบาย : ฟังก์ชันหลักสำหรับ Seed ข้อมูลเริ่มต้นเข้าสู่ฐานข้อมูลของระบบ
 * Input : ไม่มี
 * Output : ข้อมูลตัวอย่างในทุกตารางหลัก (Role, User, Community, Homestay, Store, Package ฯลฯ)
 */
async function main() {
  const hash = (password: string) => bcrypt.hashSync(password, 10);

  /*
   * ส่วนที่ 1 : Seed ข้อมูล Role พื้นฐาน
   * Input : ชื่อ Role (superadmin, admin, member, tourist)
   * Output : บันทึก Role ลงตาราง roles
   */
  await prisma.role.createMany({
    data: [
      { name: "superadmin" },
      { name: "admin" },
      { name: "member" },
      { name: "tourist" },
    ],
    skipDuplicates: true,
  });

  const roleSuper = await prisma.role.findFirst({
    where: { name: "superadmin" },
  });
  const roleAdmin = await prisma.role.findFirst({ where: { name: "admin" } });
  const roleMember = await prisma.role.findFirst({ where: { name: "member" } });
  const roleTourist = await prisma.role.findFirst({
    where: { name: "tourist" },
  });

  /*
   * ส่วนที่ 2 : สร้างผู้ใช้งานตัวอย่าง
   * Input : roleId, username, email, password, ชื่อจริง-นามสกุล
   * Output : ข้อมูลผู้ใช้งานในระบบ
   */
  const superAdmin = await prisma.user.create({
    data: {
      roleId: roleSuper!.id,
      username: "superman",
      email: "super@demo.com",
      password: hash("hashedpw"),
      fname: "Super",
      lname: "Admin",
      phone: "0810000001",
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      roleId: roleAdmin!.id,
      username: "admin1",
      email: "admin1@demo.com",
      password: hash("hashedpw"),
      fname: "Admin",
      lname: "One",
      phone: "0810000002",
    },
  });
  const admin2 = await prisma.user.create({
    data: {
      roleId: roleAdmin!.id,
      username: "admin2",
      email: "admin2@demo.com",
      password: hash("hashedpw"),
      fname: "Admin",
      lname: "Two",
      phone: "0810000003",
    },
  });
  const admin3 = await prisma.user.create({
    data: {
      roleId: roleAdmin!.id,
      username: "admin3",
      email: "admin3@demo.com",
      password: hash("hashedpw"),
      fname: "Admin",
      lname: "Three",
      phone: "0810000004",
    },
  });

  const tourist1 = await prisma.user.create({
    data: {
      roleId: roleTourist!.id,
      username: "tourist1",
      email: "tourist1@demo.com",
      password: hash("hashedpw"),
      fname: "Tourist",
      lname: "One",
      phone: "0810000007",
    },
  });

  const tourist2 = await prisma.user.create({
    data: {
      roleId: roleTourist!.id,
      username: "tourist2",
      email: "tourist2@demo.com",
      password: hash("hashedpw"),
      fname: "Tourist",
      lname: "Two",
      phone: "0810000008",
    },
  });

  /*
   * ส่วนที่ 3 : สร้างข้อมูล Location
   * Input : รายละเอียดที่อยู่, houseNumber, lat, lng
   * Output : ข้อมูลพิกัดในตาราง locations
   */
  const location1 = await prisma.location.create({
    data: {
      detail: "Main location",
      houseNumber: "123",
      subDistrict: "Sub A",
      district: "District A",
      province: "Province A",
      postalCode: "10000",
      latitude: 13.75,
      longitude: 100.5,
    },
  });
  const location2 = await prisma.location.create({
    data: {
      detail: "Second location",
      houseNumber: "456",
      subDistrict: "Sub B",
      district: "District B",
      province: "Province B",
      postalCode: "20000",
      latitude: 13.7,
      longitude: 100.55,
    },
  });
  const location3 = await prisma.location.create({
    data: {
      detail: "Third location",
      houseNumber: "789",
      subDistrict: "Sub C",
      district: "District C",
      province: "Province C",
      postalCode: "30000",
      latitude: 13.8,
      longitude: 100.6,
    },
  });

  /*
   * ส่วนที่ 4 : สร้างข้อมูล Community
   * Input : locationId, adminId, รายละเอียด community
   * Output : ข้อมูลชุมชนในตาราง communities
   */
  const community1 = await prisma.community.create({
    data: {
      locationId: location1.id,
      adminId: admin1.id,
      name: "Green Village",
      type: "Tourism",
      registerNumber: "REG001",
      registerDate: new Date("2020-01-01"),
      description: "Eco community",
      bankName: "Bangkok Bank",
      accountName: "Admin One",
      accountNumber: "1234567890",
      mainActivityName: "Farming",
      mainActivityDescription: "Organic rice",
      phone: "0901111111",
      rating: 4.5,
      email: "green@village.com",
      mainAdmin: "Admin One",
      mainAdminPhone: "0901111111",
    },
  });

  const community2 = await prisma.community.create({
    data: {
      locationId: location2.id,
      adminId: admin2.id,
      name: "Blue Village",
      type: "Cultural",
      registerNumber: "REG002",
      registerDate: new Date("2021-01-01"),
      description: "Culture community",
      bankName: "SCB",
      accountName: "Member One",
      accountNumber: "2222222222",
      mainActivityName: "Crafts",
      mainActivityDescription: "Handicraft products",
      phone: "0902222222",
      rating: 4.0,
      email: "blue@village.com",
      mainAdmin: "Member One",
      mainAdminPhone: "0902222222",
    },
  });

  const community3 = await prisma.community.create({
    data: {
      locationId: location3.id,
      adminId: admin3.id,
      name: "Red Village",
      type: "Adventure",
      registerNumber: "REG003",
      registerDate: new Date("2022-01-01"),
      description: "Adventure community",
      bankName: "KBank",
      accountName: "Tourist One",
      accountNumber: "3333333333",
      mainActivityName: "Climbing",
      mainActivityDescription: "Mountain trekking",
      phone: "0903333333",
      rating: 3.8,
      email: "red@village.com",
      mainAdmin: "Tourist One",
      mainAdminPhone: "0903333333",
    },
  });

  /*
   * ส่วนที่ 5 : เพิ่มรูปภาพของ Community
   * Input : communityId, image path, type
   * Output : ข้อมูล community_images
   */
  await prisma.communityImage.createMany({
    data: [
      {
        communityId: community1.id,
        image: "/community1.jpg",
        type: ImageType.LOGO,
      },
      {
        communityId: community2.id,
        image: "/community2.jpg",
        type: ImageType.COVER,
      },
      {
        communityId: community3.id,
        image: "/community3.jpg",
        type: ImageType.LOGO,
      },
    ],
  });

  /*
   * ส่วนที่ 6 : เพิ่มสมาชิกของชุมชน (Member)
   * Input : ข้อมูลผู้ใช้ + memberOfCommunity
   * Output : ข้อมูลผู้ใช้งานที่เป็นสมาชิก
   */
  const member1 = await prisma.user.create({
    data: {
      roleId: roleMember!.id,
      username: "member1",
      email: "member1@demo.com",
      password: hash("hashedpw"),
      fname: "Member",
      lname: "One",
      phone: "0810000005",
      memberOfCommunity: community1.id,
    },
  });
  const member2 = await prisma.user.create({
    data: {
      roleId: roleMember!.id,
      username: "member2",
      email: "member2@demo.com",
      password: hash("hashedpw"),
      fname: "Member",
      lname: "Two",
      phone: "0810000006",
      memberOfCommunity: community2.id,
      activityRole: "ผู้นำเที่ยว",
    },
  });

  /*
   * ส่วนที่ 7 : Banner
   * Input : path รูป
   * Output : แบนเนอร์แสดงบนหน้าเว็บ
   */
  await prisma.banner.createMany({
    data: [
      { image: "/images/banner1.jpg" },
      { image: "/images/banner2.jpg" },
      { image: "/images/banner3.jpg" },
    ],
  });

  /*
   * ส่วนที่ 8 : Store และรูปภาพ Store
   * Input : communityId, locationId, detail
   * Output : ข้อมูลร้านค้าและรูปประกอบ
   */
  const store1 = await prisma.store.create({
    data: {
      name: "Store A",
      detail: "Souvenirs",
      communityId: community1.id,
      locationId: location1.id,
    },
  });
  const store2 = await prisma.store.create({
    data: {
      name: "Store B",
      detail: "Food",
      communityId: community2.id,
      locationId: location2.id,
    },
  });
  const store3 = await prisma.store.create({
    data: {
      name: "Store C",
      detail: "Clothes",
      communityId: community3.id,
      locationId: location3.id,
    },
  });

  await prisma.storeImage.createMany({
    data: [
      { storeId: store1.id, image: "/store1.jpg", type: ImageType.COVER },
      { storeId: store2.id, image: "/store2.jpg", type: ImageType.COVER },
      { storeId: store3.id, image: "/store3.jpg", type: ImageType.GALLERY },
    ],
  });

  /*
   * ส่วนที่ 9 : Homestay และรูปภาพ Homestay
   * Input : communityId, locationId, รายละเอียดห้องพัก
   * Output : ข้อมูล homestay และ homestay_images
   */
  const homestay1 = await prisma.homestay.create({
    data: {
      name: "Homestay A",
      type: "Single",
      guestPerRoom: 2,
      totalRoom: 5,
      facility: "WiFi, AirCon",
      communityId: community1.id,
      locationId: location1.id,
    },
  });
  const homestay2 = await prisma.homestay.create({
    data: {
      name: "Homestay B",
      type: "Double",
      guestPerRoom: 4,
      totalRoom: 8,
      facility: "Breakfast, AC",
      communityId: community2.id,
      locationId: location2.id,
    },
  });
  const homestay3 = await prisma.homestay.create({
    data: {
      name: "Homestay C",
      type: "Dorm",
      guestPerRoom: 10,
      totalRoom: 20,
      facility: "Shared kitchen",
      communityId: community3.id,
      locationId: location3.id,
    },
  });

  await prisma.homestayImage.createMany({
    data: [
      { homestayId: homestay1.id, image: "/home1.jpg", type: ImageType.COVER },
      { homestayId: homestay2.id, image: "/home2.jpg", type: ImageType.COVER },
      {
        homestayId: homestay3.id,
        image: "/home3.jpg",
        type: ImageType.GALLERY,
      },
    ],
  });

  /*
   * ส่วนที่ 10 : Tag และความสัมพันธ์กับ Store/Homestay
   * Input : ชื่อ Tag
   * Output : ข้อมูล tag และตารางเชื่อมโยง
   */
  const tag1 = await prisma.tag.create({ data: { name: "Nature" } });
  const tag2 = await prisma.tag.create({ data: { name: "Culture" } });
  const tag3 = await prisma.tag.create({ data: { name: "Adventure" } });

  await prisma.tagStore.createMany({
    data: [
      { tagId: tag1.id, storeId: store1.id },
      { tagId: tag2.id, storeId: store2.id },
      { tagId: tag3.id, storeId: store3.id },
    ],
  });
  await prisma.tagHomestay.createMany({
    data: [
      { tagId: tag1.id, homestayId: homestay1.id },
      { tagId: tag2.id, homestayId: homestay2.id },
      { tagId: tag3.id, homestayId: homestay3.id },
    ],
  });

  /*
   * ส่วนที่ 11 : Package และ PackageFile
   * Input : communityId, overseerMemberId, createById, รายละเอียดแพ็กเกจ
   * Output : ข้อมูล package และ package_files
   */
  const pkg1 = await prisma.package.create({
    data: {
      communityId: community1.id,
      locationId: location1.id,
      overseerMemberId: member1.id,
      createById: admin1.id,
      name: "Eco Tour",
      description: "Farm visit",
      capacity: 10,
      price: 500,
      warning: "Bring boots",
      statusPackage: PackagePublishStatus.PUBLISH,
      startDate: new Date("2025-01-01"),
      dueDate: new Date("2025-01-05"),
      facility: "Meals",
    },
  });

  await prisma.packageFile.create({
    data: { packageId: pkg1.id, filePath: "/pkg1.jpg", type: ImageType.COVER },
  });

  /*
   * ส่วนที่ 12 : Booking History
   * Input : touristId, packageId, status, participant
   * Output : ประวัติการจองใน booking_histories
   */
  const booking1 = await prisma.bookingHistory.create({
    data: {
      touristId: tourist1.id,
      packageId: pkg1.id,
      bookingAt: new Date(),
      status: BookingStatus.BOOKED,
      totalParticipant: 2,
    },
  });

  /*
   * ส่วนที่ 13 : Feedback และ FeedbackImage
   * Input : bookingHistoryId, message, rating
   * Output : คำติชมและรูปแนบใน feedbacks / feedback_images
   */
  const feedback1 = await prisma.feedback.create({
    data: {
      bookingHistoryId: booking1.id,
      createdAt: new Date(),
      message: "Amazing trip!",
      rating: 5,
    },
  });

  await prisma.feedbackImage.create({
    data: { feedbackId: feedback1.id, image: "/feedback1.jpg" },
  });

  console.log("✅ Seed completed successfully!");
}

/*
 * ฟังก์ชัน : main()
 * คำอธิบาย : เรียกใช้งาน seed และจัดการปิด connection
 */
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
