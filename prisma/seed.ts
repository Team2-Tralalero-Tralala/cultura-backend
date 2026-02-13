import {
  PrismaClient,
  ImageType,
  Gender,
  CommunityStatus,
  PackagePublishStatus,
  PackageApproveStatus,
  BookingStatus,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const communityData = [
  {
    name: "วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า",
    subDistrict: "เนินเพิ่ม",
    district: "นครไทย",
    province: "พิษณุโลก",
    postalCode: "65120",
    lat: 16.99,
    lng: 101.0,
  },
  {
    name: "วิสาหกิจชุมชนกลุ่มแม่บ้านเกษตรกรมหาสวัสดิ์",
    subDistrict: "มหาสวัสดิ์",
    district: "พุทธมณฑล",
    province: "นครปฐม",
    postalCode: "73170",
    lat: 13.8,
    lng: 100.28,
  },
  {
    name: "วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว",
    subDistrict: "น้ำเชี่ยว",
    district: "แหลมงอบ",
    province: "ตราด",
    postalCode: "23120",
    lat: 12.18,
    lng: 102.43,
  },
  {
    name: "วิสาหกิจชุมชนชีววิถีตำบลน้ำเกี๋ยน",
    subDistrict: "น้ำเกี๋ยน",
    district: "ภูเพียง",
    province: "น่าน",
    postalCode: "55000",
    lat: 18.78,
    lng: 100.8,
  },
  {
    name: "วิสาหกิจชุมชนกลุ่มผลิตผ้าย้อมครามบ้านคำข่า",
    subDistrict: "ไร่",
    district: "พรรณานิคม",
    province: "สกลนคร",
    postalCode: "47130",
    lat: 17.25,
    lng: 103.95,
  },
  {
    name: "วิสาหกิจชุมชนท่องเที่ยววิถีชุมชนตำบลบ้านแหลม",
    subDistrict: "บ้านแหลม",
    district: "บางปลาม้า",
    province: "สุพรรณบุรี",
    postalCode: "72150",
    lat: 14.36,
    lng: 100.12,
  },
  {
    name: "วิสาหกิจชุมชนกลุ่มจักสานผักตบชวาบ้านบางตาแผ่น",
    subDistrict: "รางจรเข้",
    district: "เสนา",
    province: "พระนครศรีอยุธยา",
    postalCode: "13110",
    lat: 14.32,
    lng: 100.4,
  },
  {
    name: "วิสาหกิจชุมชนศูนย์ข้าวชุมชนบ้านอุมลอง",
    subDistrict: "สมัย",
    district: "สบปราบ",
    province: "ลำปาง",
    postalCode: "52170",
    lat: 17.92,
    lng: 99.35,
  },
  {
    name: "วิสาหกิจชุมชนกลุ่มแปรรูปผลผลิตทางการเกษตรบ้านถ้ำ",
    subDistrict: "บ้านถ้ำ",
    district: "ดอกคำใต้",
    province: "พะเยา",
    postalCode: "56120",
    lat: 19.16,
    lng: 99.99,
  },
  {
    name: "วิสาหกิจชุมชนท่องเที่ยวโดยชุมชนบ้านบางพลับ",
    subDistrict: "บางพรม",
    district: "บางคนที",
    province: "สมุทรสงคราม",
    postalCode: "75120",
    lat: 13.43,
    lng: 99.95,
  },
  {
    name: "วิสาหกิจชุมชนกลุ่มเลี้ยงโคเนื้อบ้านหนองแหน",
    subDistrict: "หนองแหน",
    district: "พนมสารคาม",
    province: "ฉะเชิงเทรา",
    postalCode: "24120",
    lat: 13.75,
    lng: 101.35,
  },
  {
    name: "วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านทับทิมสยาม",
    subDistrict: "คลองไก่เถื่อน",
    district: "คลองหาด",
    province: "สระแก้ว",
    postalCode: "27260",
    lat: 13.38,
    lng: 102.3,
  },
  {
    name: "วิสาหกิจชุมชนกลุ่มทอผ้าไหมบ้านดู่",
    subDistrict: "เมืองปัก",
    district: "ปักธงชัย",
    province: "นครราชสีมา",
    postalCode: "30150",
    lat: 14.71,
    lng: 102.02,
  },
  {
    name: "วิสาหกิจชุมชนเกษตรอินทรีย์บ้านหนองเม็ก",
    subDistrict: "หนองเม็ก",
    district: "หนองหาน",
    province: "อุดรธานี",
    postalCode: "41130",
    lat: 17.38,
    lng: 103.11,
  },
  {
    name: "วิสาหกิจชุมชนกลุ่มแม่บ้านเกษตรกรบ้านป่าเหมือด",
    subDistrict: "ป่าไผ่",
    district: "สันทราย",
    province: "เชียงใหม่",
    postalCode: "50210",
    lat: 18.91,
    lng: 99.04,
  },
];

const thaiTags = [
  "ท่องเที่ยวเชิงเกษตร",
  "อาหารพื้นเมือง",
  "วัฒนธรรมท้องถิ่น",
  "ธรรมชาติ",
  "โฮมสเตย์",
  "กิจกรรมกลางแจ้ง",
  "งานฝีมือ",
  "ผ้าทอ",
  "จักสาน",
  "เดินป่า",
  "ดูนก",
  "ปั่นจักรยาน",
  "ล่องแก่ง",
  "ทำอาหาร",
  "เรียนรู้วิถีชีวิต",
  "ถ่ายรูป",
  "จุดชมวิว",
  "น้ำตก",
  "ภูเขา",
  "ทะเล",
  "เกาะ",
  "วัดวาอาราม",
  "ประวัติศาสตร์",
  "สมุนไพร",
  "สุขภาพ",
  "พักผ่อน",
  "ครอบครัว",
  "คู่รัก",
  "เพื่อนฝูง",
  "สัมมนา",
  "ดูดาว",
  "Camping",
  "Workshop",
  "ตลาดน้ำ",
  "ตลาดนัด",
  "ถนนคนเดิน",
  "พิพิธภัณฑ์",
  "แกลเลอรี่",
  "ศิลปะ",
  "ดนตรี",
  "เทศกาล",
  "ประเพณี",
  "ทำบุญ",
  "สปา",
  "นวดแผนไทย",
  "โยคะ",
  "เรียนรู้เกษตร",
  "ดำนา",
  "เกี่ยวข้าว",
  "เลี้ยงสัตว์",
];

const packageNames = [
  "เที่ยวชมสวนผลไม้",
  "ล่องแพชมธรรมชาติ",
  "เรียนรู้วิถีชุมชน",
  "ดำนาปลูกข้าว",
  "ทำผ้ามัดย้อม",
  "เดินป่าศึกษาธรรมชาติ",
  "ปั่นจักรยานรอบหมู่บ้าน",
  "ทำอาหารพื้นบ้าน",
  "เก็บเห็ดในป่าชุมชน",
  "ชมหิ่งห้อยยามค่ำคืน",
  "ไหว้พระ 9 วัด",
  "ล่องเรือชมวิถีริมน้ำ",
  "พักโฮมสเตย์สัมผัสธรรมชาติ",
  "เรียนรู้การจักสาน",
  "ทำขนมไทยโบราณ",
  "ชมทะเลหมอกยามเช้า",
  "ดูนกและผีเสื้อ",
  "ปลูกป่าชายเลน",
  "เที่ยวเกาะดำน้ำดูปะการัง",
  "สัมผัสวิถีประมงพื้นบ้าน",
];

// Helper Functions
const getRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)]!;
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDatePast = () =>
  new Date(Date.now() - getRandomInt(0, 10000000000));
const getRandomDateRecent = () =>
  new Date(Date.now() - getRandomInt(0, 7 * 24 * 60 * 60 * 1000));
const getRandomDateFuture = () =>
  new Date(
    Date.now() +
      getRandomInt(7 * 24 * 60 * 60 * 1000, 30 * 24 * 60 * 60 * 1000),
  );

async function main() {
  console.log("Start seeding ...");

  // Clean Database
  await prisma.tagHomestay.deleteMany();
  await prisma.tagsPackages.deleteMany();
  await prisma.tagStore.deleteMany();
  await prisma.feedbackImage.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.homestayHistory.deleteMany();
  await prisma.bookingHistory.deleteMany();
  await prisma.packageFile.deleteMany();
  await prisma.package.deleteMany();
  await prisma.homestayImage.deleteMany();
  await prisma.homestay.deleteMany();
  await prisma.storeImage.deleteMany();
  await prisma.store.deleteMany();
  await prisma.communityImage.deleteMany();
  await prisma.communityMembers.deleteMany();
  await prisma.community.deleteMany(); // Delete communities first
  await prisma.location.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.log.deleteMany();
  await prisma.user.deleteMany(); // Then users
  await prisma.role.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.banner.deleteMany();

  // Create Roles
  const roles = await Promise.all([
    prisma.role.create({ data: { name: "superadmin" } }),
    prisma.role.create({ data: { name: "admin" } }),
    prisma.role.create({ data: { name: "member" } }),
    prisma.role.create({ data: { name: "tourist" } }),
  ]);
  const roleMap = {
    superadmin: roles.find((r) => r.name === "superadmin")!.id,
    admin: roles.find((r) => r.name === "admin")!.id,
    member: roles.find((r) => r.name === "member")!.id,
    tourist: roles.find((r) => r.name === "tourist")!.id,
  };

  // Create Tags (50 tags)
  const tagData = thaiTags.map((name) => ({ name }));
  await prisma.tag.createMany({ data: tagData });
  const allTags = await prisma.tag.findMany();

  // Common password hash
  const hashPassword = bcrypt.hashSync("hashedpw", 10);

  // --- Create Users ---

  // 1 Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      roleId: roleMap.superadmin,
      username: "superadmin",
      email: "superadmin@example.com",
      password: hashPassword,
      fname: "Super",
      lname: "Admin",
      phone: "0800000001",
      gender: Gender.MALE,
      status: UserStatus.ACTIVE,
      birthDate: getRandomDatePast(),
    },
  });

  // 25 Admins (15 for communities, 10 extras)
  const adminIds: number[] = [];
  for (let i = 0; i < 25; i++) {
    const user = await prisma.user.create({
      data: {
        roleId: roleMap.admin,
        username: `admin${i + 1}`,
        email: `admin${i + 1}@example.com`,
        password: hashPassword,
        fname: `Admin`,
        lname: `${i + 1}`,
        phone: `081${String(i).padStart(7, "0")}`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        status: UserStatus.ACTIVE,
        birthDate: getRandomDatePast(),
      },
    });
    adminIds.push(user.id);
  }

  // 50 Members (30 for communities, 20 extras)
  const memberIds: number[] = [];
  for (let i = 0; i < 50; i++) {
    const user = await prisma.user.create({
      data: {
        roleId: roleMap.member,
        username: `member${i + 1}`,
        email: `member${i + 1}@example.com`,
        password: hashPassword,
        fname: `Member`,
        lname: `${i + 1}`,
        phone: `082${String(i).padStart(7, "0")}`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        status: UserStatus.ACTIVE,
        birthDate: getRandomDatePast(),
      },
    });
    memberIds.push(user.id);
  }

  // 20 Tourists
  const touristIds: number[] = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        roleId: roleMap.tourist,
        username: `tourist${i + 1}`,
        email: `tourist${i + 1}@example.com`,
        password: hashPassword,
        fname: `Tourist`,
        lname: `${i + 1}`,
        phone: `083${String(i).padStart(7, "0")}`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        status: UserStatus.ACTIVE,
        birthDate: getRandomDatePast(),
      },
    });
    touristIds.push(user.id);
  }

  // --- Create Communities ---
  // Using 15 communities from the fixed list if available, or slice
  const targetCommunityCount = 15;
  const communitiesToCreate = communityData.slice(0, targetCommunityCount);

  // Assign Users to Communities
  // Admins: 0-14 assigned to Communities (1 each)
  // Members: 0-29 assigned to Communities (2 each)
  let adminIndex = 0;
  let memberIndex = 0;

  for (let i = 0; i < communitiesToCreate.length; i++) {
    const comInfo = communitiesToCreate[i]!;
    const adminId = adminIds[adminIndex++];
    const comMemberIds = [memberIds[memberIndex++], memberIds[memberIndex++]];

    // Create Community Location
    const location = await prisma.location.create({
      data: {
        detail: `ที่อยู่ชุมชน ${comInfo.name}`,
        houseNumber: `${getRandomInt(1, 100)}`,
        subDistrict: comInfo.subDistrict,
        district: comInfo.district,
        province: comInfo.province,
        postalCode: comInfo.postalCode,
        latitude: comInfo.lat,
        longitude: comInfo.lng,
      },
    });

    const community = await prisma.community.create({
      data: {
        name: comInfo.name,
        type: "ท่องเที่ยว",
        locationId: location.id,
        adminId: adminId!,
        registerNumber: `REG-${i + 1}`,
        registerDate: getRandomDatePast(),
        description: `รายละเอียดชุมชน ${comInfo.name} แหล่งท่องเที่ยววิถีชุมชน`,
        bankName: "KBANK",
        accountName: `บัญชี ${comInfo.name}`,
        accountNumber: `123456789${i}`,
        mainActivityName: "กิจกรรมหลักชุมชน",
        mainActivityDescription: "รายละเอียดกิจกรรมหลัก",
        status: CommunityStatus.OPEN,
        phone: `02${String(i).padStart(7, "0")}`,
        rating: 4.5,
        isRatingVisible: true,
        email: `community${i + 1}@example.com`,
        mainAdmin: `Main Admin ${i + 1}`,
        mainAdminPhone: `089${String(i).padStart(7, "0")}`,
        communityImage: {
          create: [
            { image: "uploads/store1.jpg", type: ImageType.COVER },
            { image: "uploads/store1.jpg", type: ImageType.GALLERY },
          ],
        },
        communityMembers: {
          create: comMemberIds.map((mid) => ({ memberId: mid! })),
        },
      },
    });

    // Create 5 Stores
    for (let s = 0; s < 5; s++) {
      await prisma.store.create({
        data: {
          name: `ร้านค้า ${s + 1} ของ ${comInfo.name}`,
          detail: "จำหน่ายสินค้าชุมชน",
          communityId: community.id,
          locationId: location.id, // Simplification: Same location ID
          storeImage: {
            create: [
              { image: "uploads/store1.jpg", type: ImageType.COVER },
              { image: "uploads/store1.jpg", type: ImageType.GALLERY },
              { image: "uploads/store1.jpg", type: ImageType.GALLERY },
            ],
          },
          tagStores: { create: { tagId: getRandom(allTags)!.id } }, // 1 Random Tag
        },
      });
    }

    // Create 5 Homestays
    const homestaysInCom = [];
    for (let h = 0; h < 5; h++) {
      const homestay = await prisma.homestay.create({
        data: {
          name: `โฮมสเตย์ ${h + 1} ของ ${comInfo.name}`,
          communityId: community.id,
          locationId: location.id,
          type: "บ้านพัก",
          guestPerRoom: 2,
          totalRoom: 5,
          facility: "Wifi, Air",
          homestayImage: {
            create: [
              { image: "uploads/store1.jpg", type: ImageType.COVER },
              { image: "uploads/store1.jpg", type: ImageType.GALLERY },
              { image: "uploads/store1.jpg", type: ImageType.GALLERY },
            ],
          },
          tagHomestays: { create: { tagId: getRandom(allTags)!.id } },
        },
      });
      homestaysInCom.push(homestay);
    }

    // --- Create Packages ---
    // Users who create packages: Admin (1) + Members (2)
    const creaters = [adminId, ...comMemberIds];

    for (const creatorId of creaters) {
      // Each creates 3 Active Packages
      for (let p = 0; p < 3; p++) {
        const pkg = await prisma.package.create({
          data: {
            communityId: community.id,
            locationId: location.id,
            createById: creatorId!,
            overseerMemberId: creatorId!, // Simplify: creator oversees
            name: `แพ็กเกจ ${p + 1} โดย User ${creatorId}`,
            description: "รายละเอียดแพ็กเกจท่องเที่ยว",
            capacity: 20,
            price: 1500,
            statusPackage: PackagePublishStatus.PUBLISH,
            statusApprove: PackageApproveStatus.APPROVE,
            startDate: getRandomDateFuture(),
            dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Year valid
            bookingOpenDate: new Date(),
            bookingCloseDate: getRandomDateFuture(),
            facility: "รถรับส่ง, อาหาร",
            packageFile: {
              create: { filePath: "uploads/store1.jpg", type: ImageType.COVER },
            },
            // 3 Tags per package
            tagPackages: {
              create: [
                { tagId: allTags[0]!.id },
                { tagId: allTags[1]!.id },
                { tagId: allTags[2]!.id },
              ],
            },
          },
        });

        // 10 Past Bookings (Completed -> Feedbacks)
        for (let b = 0; b < 10; b++) {
          const tourist = touristIds[b % touristIds.length]!; // Cycle through tourists
          const booking = await prisma.bookingHistory.create({
            data: {
              touristId: tourist,
              packageId: pkg.id,
              bookingAt: getRandomDatePast(),
              status: BookingStatus.BOOKED,
              totalParticipant: 2,
              isParticipate: true, // Mark as participated
            },
          });

          // Create Feedback
          await prisma.feedback.create({
            data: {
              bookingHistoryId: booking.id,
              message: `Feedback for package ${pkg.id} booking ${booking.id}`,
              rating: 5,
              createdAt: new Date(),
              responderId: adminId!,
              replyMessage: "ขอบคุณครับ",
              replyAt: new Date(),
            },
          });
        }

        // 2 Active Bookings (Pending/Booked) for "New Booking List"
        for (let b = 0; b < 2; b++) {
          const tourist = touristIds[(b + 10) % touristIds.length]!;
          await prisma.bookingHistory.create({
            data: {
              touristId: tourist,
              packageId: pkg.id,
              bookingAt: new Date(), // Now
              status: BookingStatus.PENDING,
              totalParticipant: 2,
              transferSlip: "uploads/slip.jpg",
            },
          });
        }
      }

      // Each creates 3 Draft Packages
      for (let p = 0; p < 3; p++) {
        await prisma.package.create({
          data: {
            communityId: community.id,
            locationId: location.id,
            createById: creatorId!,
            overseerMemberId: creatorId!,
            name: `แพ็กเกจร่าง ${p + 1} โดย User ${creatorId}`,
            description: "รายละเอียดแพ็กเกจร่าง",
            capacity: 20,
            price: 1500,
            statusPackage: PackagePublishStatus.DRAFT,
            statusApprove: PackageApproveStatus.PENDING, // Draft usually pending or none
            startDate: getRandomDateFuture(),
            dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            bookingOpenDate: new Date(),
            bookingCloseDate: getRandomDateFuture(),
            facility: "รถรับส่ง, อาหาร",
            packageFile: {
              create: { filePath: "uploads/store1.jpg", type: ImageType.COVER },
            },
            tagPackages: {
              create: [
                { tagId: allTags[3]!.id },
                { tagId: allTags[4]!.id },
                { tagId: allTags[5]!.id },
              ],
            },
          },
        });
      }
    }

    // Community History: 5 Ended Packages (Expired Due Date)
    for (let h = 0; h < 5; h++) {
      await prisma.package.create({
        data: {
          communityId: community.id,
          locationId: location.id,
          createById: adminId!,
          name: `แพ็กเกจประวัติ ${h + 1}`,
          statusPackage: PackagePublishStatus.PUBLISH,
          statusApprove: PackageApproveStatus.APPROVE,
          startDate: getRandomDatePast(),
          dueDate: getRandomDatePast(), // Already ended
          bookingOpenDate: getRandomDatePast(),
          bookingCloseDate: getRandomDatePast(),
          packageFile: {
            create: { filePath: "uploads/store1.jpg", type: ImageType.COVER },
          },
        },
      });
    }
  } // End Community Loop

  // --- Global Items ---

  // 1. Tourist Refund Requests: 5 requests
  // Pick random active packages to refund
  const allPackages = await prisma.package.findMany({
    where: {
      statusPackage: PackagePublishStatus.PUBLISH,
      statusApprove: PackageApproveStatus.APPROVE,
    },
  });

  if (allPackages.length > 0) {
    for (let i = 0; i < 5; i++) {
      const pkg = allPackages[i % allPackages.length];
      const tourist = touristIds[i % touristIds.length]; // Distinct tourists
      await prisma.bookingHistory.create({
        data: {
          touristId: tourist!,
          packageId: pkg!.id,
          bookingAt: getRandomDateRecent(),
          status: BookingStatus.REFUND_PENDING, // Requesting refund
          totalParticipant: 1,
          transferSlip: "uploads/slip.jpg",
          refundReason: "ไม่สะดวกเดินทางแล้วครับ",
        },
      });
    }
  }

  const allCommunityAdmins = adminIds.slice(0, 15); // First 15 are Com Admins
  const allCommunityMembers = memberIds.slice(0, 30); // First 30 are Com Members
  const potentialCreators = [...allCommunityAdmins, ...allCommunityMembers];

  // We need valid community IDs for these.
  const allCommunities = await prisma.community.findMany();

  for (let i = 0; i < 50; i++) {
    const creatorId = potentialCreators[i % potentialCreators.length];
    const com = allCommunities[i % allCommunities.length];

    await prisma.package.create({
      data: {
        communityId: com!.id,
        createById: creatorId!, // Ideally should match community logic
        name: `แพ็กเกจรออนุมัติ ${i + 1}`,
        description: "รอตรวจสอบ",
        price: 1000,
        statusPackage: PackagePublishStatus.PUBLISH, // Published but waiting approval
        statusApprove: PackageApproveStatus.PENDING_SUPER, // Waiting for Super Admin? Or just PENDING
        startDate: getRandomDateFuture(),
        dueDate: getRandomDateFuture(),
        packageFile: {
          create: { filePath: "uploads/store1.jpg", type: ImageType.COVER },
        },
      },
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
