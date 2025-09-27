// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import bcrypt from "bcrypt";

async function main() {
  const hash = (password: string) => bcrypt.hashSync(password, 10);

  const roles = await prisma.role.createMany({
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
      gender: "MALE",
      birthDate: new Date("1995-05-20"),
      subDistrict: "บางรัก",
      district: "กรุงเทพมหานคร",
      province: "กรุงเทพฯ",
      postalCode: "10500",
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
      gender: "FEMALE",
      birthDate: new Date("1998-11-10"),
      subDistrict: "หาดใหญ่",
      district: "สงขลา",
      province: "สงขลา",
      postalCode: "90110",
    },
  });

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

  const bank1 = await prisma.bankAccount.create({
    data: {
      bankName: "Bangkok Bank",
      accountName: "Admin One",
      accountNumber: "1234567890",
    },
  });
  const bank2 = await prisma.bankAccount.create({
    data: {
      bankName: "SCB",
      accountName: "Member One",
      accountNumber: "2222222222",
    },
  });
  const bank3 = await prisma.bankAccount.create({
    data: {
      bankName: "KBank",
      accountName: "Tourist One",
      accountNumber: "3333333333",
    },
  });

  const community1 = await prisma.community.create({
    data: {
      locationId: location1.id,
      adminId: admin1!.id,
      bankAccountId: bank1.id,
      name: "Green Village",
      type: "Tourism",
      registerNumber: "REG001",
      registerDate: new Date("2020-01-01"),
      description: "Eco community",
      mainActivityName: "Farming",
      mainActivityDescription: "Organic rice",
      phone: "0901111111",
      rating: 4.5,
      email: "green@village.com",
      bank: "Bangkok Bank",
      bankAccountName: "Admin One",
      bankAccountNumber: "1234567890",
      mainAdmin: "Admin One",
      mainAdminPhone: "0901111111",
    },
  });

  const community2 = await prisma.community.create({
    data: {
      locationId: location2.id,
      adminId: admin2!.id,
      bankAccountId: bank2.id,
      name: "Blue Village",
      type: "Cultural",
      registerNumber: "REG002",
      registerDate: new Date("2021-01-01"),
      description: "Culture community",
      mainActivityName: "Crafts",
      mainActivityDescription: "Handicraft products",
      phone: "0902222222",
      rating: 4.0,
      email: "blue@village.com",
      bank: "SCB",
      bankAccountName: "Member One",
      bankAccountNumber: "2222222222",
      mainAdmin: "Member One",
      mainAdminPhone: "0902222222",
    },
  });

  const community3 = await prisma.community.create({
    data: {
      locationId: location3.id,
      adminId: admin3!.id,
      bankAccountId: bank3.id,
      name: "Red Village",
      type: "Adventure",
      registerNumber: "REG003",
      registerDate: new Date("2022-01-01"),
      description: "Adventure community",
      mainActivityName: "Climbing",
      mainActivityDescription: "Mountain trekking",
      phone: "0903333333",
      rating: 3.8,
      email: "red@village.com",
      bank: "KBank",
      bankAccountName: "Tourist One",
      bankAccountNumber: "3333333333",
      mainAdmin: "Tourist One",
      mainAdminPhone: "0903333333",
    },
  });

  await prisma.communityImage.createMany({
    data: [
      { communityId: community1.id, image: "/community1.jpg", type: "LOGO" },
      { communityId: community2.id, image: "/community2.jpg", type: "COVER" },
      { communityId: community1.id, image: "/community3.jpg", type: "LOGO" },
    ],
  });
  const member1 = await prisma.user.create({
    data: {
      roleId: roleMember!.id,
      username: "member1",
      email: "member1@demo.com",
      password: hash("hashedpw"),
      fname: "Member",
      lname: "One",
      phone: "0810000005",
      memberOfCommunity: 1,
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
      memberOfCommunity: 2,
      activityRole: "ผู้นำเที่ยว",
    },
  });

  await prisma.banner.createMany({
    data: [
      { image: "/images/banner1.jpg" },
      { image: "/images/banner2.jpg" },
      { image: "/images/banner3.jpg" },
    ],
  });

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
      { storeId: store1.id, image: "/store1.jpg", type: "COVER" },
      { storeId: store2.id, image: "/store2.jpg", type: "COVER" },
      { storeId: store3.id, image: "/store3.jpg", type: "GALLERY" },
    ],
  });

  const homestay1 = await prisma.homestay.create({
    data: {
      name: "Homestay A",
      roomType: "Single",
      capacity: 2,
      communityId: community1.id,
      locationId: location1.id,
      detail: "Homestay",
    },
  });
  const homestay2 = await prisma.homestay.create({
    data: {
      name: "Homestay B",
      roomType: "Double",
      capacity: 4,
      communityId: community2.id,
      locationId: location2.id,
      detail: "Homestay",
    },
  });
  const homestay3 = await prisma.homestay.create({
    data: {
      name: "Homestay C",
      roomType: "Dorm",
      capacity: 10,
      communityId: community3.id,
      locationId: location3.id,
      detail: "Homestay",
    },
  });
  await prisma.homestayImage.createMany({
    data: [
      { homestayId: homestay1.id, image: "/home1.jpg", type: "COVER" },
      { homestayId: homestay2.id, image: "/home2.jpg", type: "COVER" },
      { homestayId: homestay3.id, image: "/home3.jpg", type: "GALLERY" },
    ],
  });

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

  const pkg1 = await prisma.package.create({
    data: {
      communityId: community1.id,
      locationId: location1.id,
      overseerMemberId: member1!.id,
      createById: admin1!.id,
      name: "Eco Tour",
      description: "Farm visit",
      capacity: 10,
      price: 500,
      warning: "Bring boots",
      statusPackage: "PUBLISH",
      startDate: new Date("2025-01-01"),
      dueDate: new Date("2025-01-05"),
      facility: "Meals",
    },
  });
  const pkg2 = await prisma.package.create({
    data: {
      communityId: community2.id,
      locationId: location2.id,
      overseerMemberId: member2!.id,
      createById: admin2!.id,
      name: "Cultural Tour",
      description: "Handicrafts",
      capacity: 15,
      price: 800,
      warning: "No flash photos",
      statusPackage: "DRAFT",
      startDate: new Date("2025-02-01"),
      dueDate: new Date("2025-02-05"),
      facility: "Guide",
    },
  });
  const pkg3 = await prisma.package.create({
    data: {
      communityId: community3.id,
      locationId: location3.id,
      overseerMemberId: member1!.id,
      createById: admin1!.id,
      name: "Adventure Tour",
      description: "Mountain climbing",
      capacity: 20,
      price: 1500,
      warning: "Physical checkup required",
      statusPackage: "UNPUBLISH",
      startDate: new Date("2025-03-01"),
      dueDate: new Date("2025-03-10"),
      facility: "Gear",
    },
  });
  await prisma.packageFile.createMany({
    data: [
      { packageId: pkg1.id, filePath: "/pkg1.jpg", type: "COVER" },
      { packageId: pkg2.id, filePath: "/pkg2.jpg", type: "COVER" },
      { packageId: pkg3.id, filePath: "/pkg3.jpg", type: "GALLERY" },
    ],
  });
  await prisma.tagsPackages.createMany({
    data: [
      { tagId: tag1.id, packageId: pkg1.id },
      { tagId: tag2.id, packageId: pkg2.id },
      { tagId: tag3.id, packageId: pkg3.id },
    ],
  });

  const booking1 = await prisma.bookingHistory.create({
    data: {
      touristId: tourist1!.id,
      packageId: pkg1.id,
      touristBankId: bank3.id,
      bookingAt: new Date(),
      status: "BOOKED",
      totalParticipant: 2,
    },
  });
  const booking2 = await prisma.bookingHistory.create({
    data: {
      touristId: tourist2!.id,
      packageId: pkg2.id,
      touristBankId: bank3.id,
      bookingAt: new Date(),
      status: "PENDING",
      totalParticipant: 3,
    },
  });
  const booking3 = await prisma.bookingHistory.create({
    data: {
      touristId: tourist1!.id,
      packageId: pkg3.id,
      touristBankId: bank3.id,
      bookingAt: new Date(),
      status: "CANCELLED",
      totalParticipant: 1,
    },
  });

  const feedback1 = await prisma.feedback.create({
    data: {
      bookingHistoryId: booking1.id,
      createdAt: new Date(),
      message: "Amazing trip!",
      rating: 5,
    },
  });

  const feedback2 = await prisma.feedback.create({
    data: {
      bookingHistoryId: booking2.id,
      createdAt: new Date(),
      message: "Good but delayed",
      rating: 3,
    },
  });

  const feedback3 = await prisma.feedback.create({
    data: {
      bookingHistoryId: booking3.id,
      createdAt: new Date(),
      message: "Had to cancel",
      rating: 1,
    },
  });

  await prisma.feedbackImage.createMany({
    data: [
      { feedbackId: feedback1.id, image: "/home1.jpg" },
      { feedbackId: feedback2.id, image: "/home2.jpg" },
      { feedbackId: feedback3.id, image: "/home3.jpg" },
    ],
  });

  console.log("Seed completed successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
