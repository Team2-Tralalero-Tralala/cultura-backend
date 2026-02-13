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

const communitiesSeedData = [
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

const thaiTagNames = [
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

const packageSeedNames = [
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
  await prisma.community.deleteMany();
  await prisma.location.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.log.deleteMany();
  await prisma.user.deleteMany();
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

  // Create Tags
  const tagData = thaiTagNames.map((name) => ({ name }));
  await prisma.tag.createMany({ data: tagData });
  const allTags = await prisma.tag.findMany();

  // Default password for all users
  const hashedPassword = bcrypt.hashSync("hashedpw", 10);

  // --- Create Users ---

  const superAdmin = await prisma.user.create({
    data: {
      roleId: roleMap.superadmin,
      username: "superadmin",
      email: "superadmin@example.com",
      password: hashedPassword,
      fname: "Super",
      lname: "Admin",
      phone: "0800000001",
      gender: Gender.MALE,
      status: UserStatus.ACTIVE,
      birthDate: getRandomDatePast(),
    },
  });

  // Admins
  const adminIds: number[] = [];
  for (let i = 0; i < 25; i++) {
    const user = await prisma.user.create({
      data: {
        roleId: roleMap.admin,
        username: `admin${i + 1}`,
        email: `admin${i + 1}@example.com`,
        password: hashedPassword,
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

  // Members
  const memberIds: number[] = [];
  for (let i = 0; i < 50; i++) {
    const user = await prisma.user.create({
      data: {
        roleId: roleMap.member,
        username: `member${i + 1}`,
        email: `member${i + 1}@example.com`,
        password: hashedPassword,
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

  // Tourists
  const touristIds: number[] = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        roleId: roleMap.tourist,
        username: `tourist${i + 1}`,
        email: `tourist${i + 1}@example.com`,
        password: hashedPassword,
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

  const targetCommunityCount = 15;
  const communitiesToCreate = communitiesSeedData.slice(
    0,
    targetCommunityCount,
  );

  let assignedAdminIndex = 0;
  let assignedMemberIndex = 0;

  for (let i = 0; i < communitiesToCreate.length; i++) {
    const communityInfo = communitiesToCreate[i]!;
    const adminId = adminIds[assignedAdminIndex++];
    const communityMemberIds = [
      memberIds[assignedMemberIndex++],
      memberIds[assignedMemberIndex++],
    ];

    const location = await prisma.location.create({
      data: {
        detail: `ที่อยู่ชุมชน ${communityInfo.name}`,
        houseNumber: `${getRandomInt(1, 100)}`,
        subDistrict: communityInfo.subDistrict,
        district: communityInfo.district,
        province: communityInfo.province,
        postalCode: communityInfo.postalCode,
        latitude: communityInfo.lat,
        longitude: communityInfo.lng,
      },
    });

    const community = await prisma.community.create({
      data: {
        name: communityInfo.name,
        type: "ท่องเที่ยว",
        locationId: location.id,
        adminId: adminId!,
        registerNumber: `REG-${i + 1}`,
        registerDate: getRandomDatePast(),
        description: `รายละเอียดชุมชน ${communityInfo.name} แหล่งท่องเที่ยววิถีชุมชน`,
        bankName: "KBANK",
        accountName: `ACC-${i}`,
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
          create: communityMemberIds.map((mid) => ({ memberId: mid! })),
        },
      },
    });

    for (let s = 0; s < 5; s++) {
      await prisma.store.create({
        data: {
          name: `ร้านค้า ${s + 1}`,
          detail: "จำหน่ายสินค้าชุมชน",
          communityId: community.id,
          locationId: location.id,
          storeImage: {
            create: [
              { image: "uploads/store1.jpg", type: ImageType.COVER },
              { image: "uploads/store1.jpg", type: ImageType.GALLERY },
              { image: "uploads/store1.jpg", type: ImageType.GALLERY },
            ],
          },
          tagStores: { create: { tagId: getRandom(allTags)!.id } },
        },
      });
    }

    const communityHomestays = [];
    for (let h = 0; h < 5; h++) {
      const homestay = await prisma.homestay.create({
        data: {
          name: `โฮมสเตย์ ${h + 1} `,
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
      communityHomestays.push(homestay);
    }

    // --- Create Packages ---
    const packageCreators = [adminId, ...communityMemberIds];

    for (const creatorId of packageCreators) {
      // 3 Active Packages per creator
      for (let p = 0; p < 3; p++) {
        const travelPackage = await prisma.package.create({
          data: {
            communityId: community.id,
            locationId: location.id,
            createById: creatorId!,
            overseerMemberId: creatorId!,
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
            tagPackages: {
              create: [
                { tagId: allTags[0]!.id },
                { tagId: allTags[1]!.id },
                { tagId: allTags[2]!.id },
              ],
            },
          },
        });

        const activeBookingStatuses = [
          BookingStatus.PENDING,
          BookingStatus.BOOKED,
          BookingStatus.REJECTED,
          BookingStatus.REFUND_PENDING,
          BookingStatus.REFUNDED,
          BookingStatus.REFUND_REJECTED,
        ];

        for (let b = 0; b < activeBookingStatuses.length; b++) {
          const status = activeBookingStatuses[b];
          const validCreatorId = creatorId || 0;
          const tourist =
            touristIds[(b + i + p + validCreatorId) % touristIds.length]!;

          let statusSpecificData: any = {};
          if (status === BookingStatus.REJECTED) {
            statusSpecificData = { rejectReason: "แพ็กเกจเต็มแล้วครับ" };
          } else if (status === BookingStatus.REFUND_PENDING) {
            statusSpecificData = { refundReason: "เจ็บป่วยกระทันหัน" };
          } else if (status === BookingStatus.REFUNDED) {
            statusSpecificData = {
              refundReason: "เจ็บป่วยกระทันหัน",
              refundAt: new Date(),
            };
          } else if (status === BookingStatus.REFUND_REJECTED) {
            statusSpecificData = {
              refundReason: "เจ็บป่วยกระทันหัน",
              rejectReason: "หลักฐานไม่เพียงพอ",
            };
          }

          await prisma.bookingHistory.create({
            data: {
              touristId: tourist,
              packageId: travelPackage.id,
              bookingAt: new Date(),
              status: status,
              totalParticipant: 2,
              transferSlip: "uploads/slip.jpg",
              ...statusSpecificData,
            },
          });
        }
      }

      // 3 Draft Packages per creator
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
            statusApprove: PackageApproveStatus.PENDING,
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

    // Community History: 5 Ended Packages
    for (let h = 0; h < 5; h++) {
      const historyPackage = await prisma.package.create({
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

      for (let b = 0; b < 10; b++) {
        const tourist = touristIds[b % touristIds.length]!;
        const booking = await prisma.bookingHistory.create({
          data: {
            touristId: tourist,
            packageId: historyPackage.id,
            bookingAt: getRandomDatePast(),
            status: BookingStatus.BOOKED,
            totalParticipant: 2,
            isParticipate: true,
          },
        });

        await prisma.feedback.create({
          data: {
            bookingHistoryId: booking.id,
            message: `Feedback for package ${historyPackage.id} booking ${booking.id}`,
            rating: 5,
            createdAt: new Date(),
            responderId: adminId!,
            replyMessage: "ขอบคุณครับ",
            replyAt: new Date(),
          },
        });
      }
    }
  }
  const publishedPackages = await prisma.package.findMany({
    where: {
      statusPackage: PackagePublishStatus.PUBLISH,
      statusApprove: PackageApproveStatus.APPROVE,
    },
  });

  if (publishedPackages.length > 0) {
    for (let i = 0; i < 5; i++) {
      const travelPackage = publishedPackages[i % publishedPackages.length];
      const tourist = touristIds[i % touristIds.length];
      await prisma.bookingHistory.create({
        data: {
          touristId: tourist!,
          packageId: travelPackage!.id,
          bookingAt: getRandomDateRecent(),
          status: BookingStatus.REFUND_PENDING,
          totalParticipant: 1,
          transferSlip: "uploads/slip.jpg",
          refundReason: "ไม่สะดวกเดินทางแล้วครับ",
        },
      });
    }
  }

  const allCommunityAdmins = adminIds.slice(0, 15);
  const allCommunityMembers = memberIds.slice(0, 30);
  const pendingPackageCreators = [
    ...allCommunityAdmins,
    ...allCommunityMembers,
  ];

  const allCommunities = await prisma.community.findMany();

  for (let i = 0; i < 50; i++) {
    const creatorId = pendingPackageCreators[i % pendingPackageCreators.length];
    const community = allCommunities[i % allCommunities.length];

    await prisma.package.create({
      data: {
        communityId: community!.id,
        createById: creatorId!,
        name: `แพ็กเกจรออนุมัติ ${i + 1}`,
        description: "รอตรวจสอบ",
        price: 1000,
        statusPackage: PackagePublishStatus.PUBLISH,
        statusApprove: PackageApproveStatus.PENDING_SUPER,
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
