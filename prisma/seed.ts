import {
  PrismaClient,
  Gender,
  CommunityStatus,
  PackagePublishStatus,
  PackageApproveStatus,
  BookingStatus,
  HHStatus,
  LogStatus,
  UserStatus,
} from "@prisma/client";

import bcrypt from "bcrypt";
const prisma = new PrismaClient();
async function main() {
  const hash = (password: string) => bcrypt.hashSync(password, 10);
  const now = new Date();

  // --- role ---
  const [roleSuper, roleAdmin, roleMember, roleTourist] = await Promise.all([
    prisma.role.upsert({
      where: { name: "superadmin" },
      update: {},
      create: { name: "superadmin" },
    }),
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    }),
    prisma.role.upsert({
      where: { name: "member" },
      update: {},
      create: { name: "member" },
    }),
    prisma.role.upsert({
      where: { name: "tourist" },
      update: {},
      create: { name: "tourist" },
    }),
  ]);

  // --- User ---
  const tourist1 = await prisma.user.upsert({
    where: { email: "tourist1@prisma.io" },
    update: {},
    create: {
      roleId: roleTourist.id,
      username: "tourist1",
      email: "tourist1@cultura.local",
      password: "tourist@1",
      fname: "tourist1",
      lname: "tourist1",
      phone: "0900000000",
      gender: Gender.FEMALE,
      status: UserStatus.ACTIVE,
      birthDate: new Date("1998-05-05"),
      province: "เชียงใหม่",
      district: "เมืองเชียงใหม่",
      subDistrict: "ศรีภูมิ",
      postalCode: "50000",
    },
  });
  const tourist2 = await prisma.user.upsert({
    where: { email: "tourist2@prisma.io" },
    update: {},
    create: {
      roleId: roleTourist.id,
      username: "tourist2",
      email: "tourist2@cultura.local",
      password: "tourist@2",
      fname: "tourist2",
      lname: "tourist2",
      phone: "0800000000",
      gender: Gender.MALE,
      status: UserStatus.BLOCKED,
      birthDate: new Date("1995-01-01"),
      province: "ชลบุรี",
      district: "เมืองชลบุรี",
      subDistrict: "บางปลาสร้อย",
      postalCode: "20000",
    },
  });
  const admin1 = await prisma.user.upsert({
    where: { email: "admin1@prisma.io" },
    update: {},
    create: {
      roleId: roleAdmin.id,
      username: "admin1",
      email: "admin1@cultura.local",
      password: "admin@1",
      fname: "admin1",
      lname: "admin1",
      phone: "0810002000",
      gender: Gender.MALE,
      status: UserStatus.ACTIVE,
    },
  });
  const admin2 = await prisma.user.upsert({
    where: { email: "admin2@prisma.io" },
    update: {},
    create: {
      roleId: roleAdmin.id,
      username: "admin2",
      email: "admin2@cultura.local",
      password: "admin@2",
      fname: "admin2",
      lname: "admin2",
      phone: "0810000000",
      gender: Gender.MALE,
      status: UserStatus.ACTIVE,
    },
  });
  const member1 = await prisma.user.upsert({
    where: { email: "member1@prisma.io" },
    update: {},
    create: {
      roleId: roleMember.id,
      username: "member1",
      email: "member1@cultura.local",
      password: "member@1",
      fname: "member1",
      lname: "member1",
      phone: "0811000000",
      gender: Gender.MALE,
      status: UserStatus.ACTIVE,
    },
  });
  const member2 = await prisma.user.upsert({
    where: { email: "member2@prisma.io" },
    update: {},
    create: {
      roleId: roleMember.id,
      username: "member2",
      email: "member2@cultura.local",
      password: "member@2",
      fname: "member2",
      lname: "member2",
      phone: "0811000100",
      gender: Gender.FEMALE,
      status: UserStatus.BLOCKED,
      activityRole: "ผู้ใหญ่บ้าน",
    },
  });

  const superAdmin1 = await prisma.user.upsert({
    where: { email: "superAdmin1@prisma.io" },
    update: {},
    create: {
      roleId: roleSuper.id,
      username: "superAdmin1",
      email: "superAdmin1@cultura.local",
      password: "superAdmin@1",
      fname: "superAdmin1",
      lname: "superAdmin1",
      phone: "0811000120",
      gender: Gender.FEMALE,
      status: UserStatus.ACTIVE,
    },
  });
  const superAdmin2 = await prisma.user.upsert({
    where: { email: "superAdmin2@prisma.io" },
    update: {},
    create: {
      roleId: roleSuper.id,
      username: "superAdmin2",
      email: "superAdmin2@cultura.local",
      password: "superAdmin@2",
      fname: "superAdmin2",
      lname: "superAdmin2",
      phone: "0811010120",
      gender: Gender.FEMALE,
      status: UserStatus.ACTIVE,
    },
  });
  // --- Location ---
  const loc1 = await prisma.location.create({
    data: {
      houseNumber: "99/1",
      villageNumber: 5,
      alley: "ซอยดอกไม้",
      subDistrict: "ศรีราชา",
      district: "ศรีราชา",
      province: "ชลบุรี",
      postalCode: "20110",
      detail: "ใกล้ห้างโรบินสัน",
      latitude: 13.1737,
      longitude: 100.9306,
    },
  });
  const loc2 = await prisma.location.create({
    data: {
      houseNumber: "99/11",
      villageNumber: 5,
      alley: "ซอยดอกรัก",
      subDistrict: "ศรีราชา",
      district: "ศรีราชา",
      province: "ชลบุรี",
      postalCode: "20110",
      detail: "ตรงนี้้",
      latitude: 13.1767,
      longitude: 100.9311,
    },
  });
  // --- Community ---
  const community = await prisma.community.create({
    data: {
      locationId: loc1.id,
      name: "วิสาหกิจชุมชนบ้านสวน",
      alias: "สวนเกษตร",
      type: "การท่องเที่ยวเชิงเกษตร",
      registerNumber: "REG12345",
      registerDate: new Date("2020-01-10"),
      description: "ชุมชนที่ส่งเสริมการท่องเที่ยวและเกษตรอินทรีย์",
      mainActivityName: "ปลูกผักปลอดสาร",
      mainActivityDescription: "นักท่องเที่ยวเรียนรู้และทดลองปลูกผัก",
      status: CommunityStatus.OPEN,
      phone: "0823456789",
      rating: 4.5,
      email: "bansuankom@cultura.com",
      bank: "กรุงไทย",
      bankAccountName: "วิสาหกิจชุมชนบ้านสวน",
      bankAccountNumber: "1234567890",
      mainAdmin: "สมชาย ใจดี",
      mainAdminPhone: "0812345678",
      coordinatorName: "สุดา สุขใจ",
      coordinatorPhone: "0898765432",
      urlFacebook: "https://facebook.com/bansuankom",
    },
  });

  // --- Community Member ---
  const cm = await prisma.communityMember.create({
    data: {
      communityId: community.id,
      memberId: member1.id,
      roleId: roleMember.id,
    },
  });
  // --- Package ---
  const pkg = await prisma.package.create({
    data: {
      communityId: community.id,
      locationId: loc1.id,
      overseerMemberId: member1.id,
      name: "ทริปเรียนรู้ปลูกผัก",
      description: "นักท่องเที่ยวเข้ามาเรียนรู้การปลูกผักอินทรีย์",
      capacity: 20,
      price: 500.0,
      warning: "ควรเตรียมหมวกกันแดด",
      statusPackage: PackagePublishStatus.PUBLISH,
      statusApprove: PackageApproveStatus.APPROVE,
      startDate: new Date("2025-10-01T08:00:00"),
      dueDate: new Date("2025-10-02T17:00:00"),
      facility: "ห้องน้ำสะอาด, อุปกรณ์ทำสวนครบ",
    },
  });

  // --- Store ---
  await prisma.store.create({
    data: {
      communityId: community.id,
      locationId: loc1.id,
      name: "ร้านของฝากบ้านสวน",
      detail: "ขายผักสด ผลไม้ และผลิตภัณฑ์ชุมชน",
    },
  });

  // --- Homestay ---
  const homestay = await prisma.homestay.create({
    data: {
      communityId: community.id,
      locationId: loc2.id,
      name: "โฮมสเตย์สวนเกษตร",
      roomType: "บ้านพัก 2 ห้องนอน",
      capacity: 6,
    },
  });

  // --- Booking History ---
  const booking = await prisma.bookingHistory.create({
    data: {
      touristId: tourist1.id,
      packageId: pkg.id,
      bookingAt: new Date(),
      status: BookingStatus.BOOKED,
      totalParticipant: 3,
    },
  });

  // --- Feedback ---
  await prisma.feedback.create({
    data: {
      bookingHistoryId: booking.id,
      createdAt: new Date(),
      message: "ประทับใจมาก ได้เรียนรู้วิถีชีวิตชาวบ้าน",
      rating: 5,
    },
  });
  // ========== TAGS ==========
  const tagEco = await prisma.tag.create({ data: { name: "Eco" } });
  const tagRice = await prisma.tag.create({ data: { name: "Rice" } });

  await prisma.tagsPackages.create({
    data: {
      tagId: tagEco.id,
      packageId: pkg.id,
    },
  });

  await prisma.tagHomestay.create({
    data: {
      tagId: tagRice.id,
      homestayId: homestay.id,
    },
  });

  // ========== LOG ==========
  await prisma.log.create({
    data: {
      userId: roleSuper.id,
      loginTime: new Date(),
      status: "SUCCESS",
      ipAddress: "127.0.0.1",
    },
  });

  // ========== PERMISSIONS ==========
  const perm = await prisma.permission.create({
    data: {
      id: 1,
      name: "MANAGE_COMMUNITY",
    },
  });

  await prisma.permissionRole.create({
    data: {
      permissionId: perm.id,
      roleId: roleAdmin.id,
    },
  });

  console.log("🌱 Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
