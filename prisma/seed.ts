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

// ข้อมูลจำลองสำหรับวิสาหกิจชุมชน (อิงจาก SMCE)
const communityNames = [
  "วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า",
  "วิสาหกิจชุมชนกลุ่มแม่บ้านเกษตรกรมหาสวัสดิ์",
  "วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว",
  "วิสาหกิจชุมชนชีววิถีตำบลน้ำเกี๋ยน",
  "วิสาหกิจชุมชนกลุ่มผลิตผ้าย้อมครามบ้านคำข่า",
  "วิสาหกิจชุมชนท่องเที่ยววิถีชุมชนตำบลบ้านแหลม",
  "วิสาหกิจชุมชนกลุ่มจักสานผักตบชวาบ้านบางตาแผ่น",
  "วิสาหกิจชุมชนศูนย์ข้าวชุมชนบ้านอุมลอง",
  "วิสาหกิจชุมชนกลุ่มแปรรูปผลผลิตทางการเกษตรบ้านถ้ำ",
  "วิสาหกิจชุมชนท่องเที่ยวโดยชุมชนบ้านบางพลับ",
  "วิสาหกิจชุมชนกลุ่มเลี้ยงโคเนื้อบ้านหนองแหน",
  "วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านทับทิมสยาม",
  "วิสาหกิจชุมชนกลุ่มทอผ้าไหมบ้านดู่",
  "วิสาหกิจชุมชนเกษตรอินทรีย์บ้านหนองเม็ก",
  "วิสาหกิจชุมชนกลุ่มแม่บ้านเกษตรกรบ้านป่าเหมือด",
  "วิสาหกิจชุมชนท่องเที่ยวเชิงอนุรักษ์บ้านแม่กำปอง",
  "วิสาหกิจชุมชนกลุ่มทำสวนผลไม้บ้านปรางค์",
  "วิสาหกิจชุมชนกลุ่มกาแฟบ้านถ้ำสิงห์",
  "วิสาหกิจชุมชนกลุ่มหัตถกรรมบาติกยางกล้วย",
  "วิสาหกิจชุมชนท่องเที่ยวเกาะกลางกระบี่",
  "วิสาหกิจชุมชนคนรักษ์ป่าบ้านหนองแม่นา",
  "วิสาหกิจชุมชนกลุ่มประมงพื้นบ้านบ้านแหลมผักเบี้ย",
];

const realLocations = [
  {
    subDistrict: "สุเทพ",
    district: "เมืองเชียงใหม่",
    province: "เชียงใหม่",
    postalCode: "50200",
  },
  {
    subDistrict: "ป่าตอง",
    district: "กะทู้",
    province: "ภูเก็ต",
    postalCode: "83150",
  },
  {
    subDistrict: "แสนสุข",
    district: "เมืองชลบุรี",
    province: "ชลบุรี",
    postalCode: "20130",
  },
  {
    subDistrict: "ในเมือง",
    district: "เมืองขอนแก่น",
    province: "ขอนแก่น",
    postalCode: "40000",
  },
  {
    subDistrict: "ในเวียง",
    district: "เมืองน่าน",
    province: "น่าน",
    postalCode: "55000",
  },
  {
    subDistrict: "อ่าวนาง",
    district: "เมืองกระบี่",
    province: "กระบี่",
    postalCode: "81000",
  },
  {
    subDistrict: "เกาะช้าง",
    district: "เกาะช้าง",
    province: "ตราด",
    postalCode: "23170",
  },
  {
    subDistrict: "บ่อผุด",
    district: "เกาะสมุย",
    province: "สุราษฎร์ธานี",
    postalCode: "84320",
  },
  {
    subDistrict: "ประตูชัย",
    district: "พระนครศรีอยุธยา",
    province: "พระนครศรีอยุธยา",
    postalCode: "13000",
  },
  {
    subDistrict: "ท่าเสา",
    district: "ไทรโยค",
    province: "กาญจนบุรี",
    postalCode: "71150",
  },
  {
    subDistrict: "แม่แรม",
    district: "แม่ริม",
    province: "เชียงใหม่",
    postalCode: "50180",
  },
  {
    subDistrict: "เทพกระษัตรี",
    district: "ถลาง",
    province: "ภูเก็ต",
    postalCode: "83110",
  },
  {
    subDistrict: "หนองปรือ",
    district: "บางละมุง",
    province: "ชลบุรี",
    postalCode: "20150",
  },
  {
    subDistrict: "ศิลา",
    district: "เมืองขอนแก่น",
    province: "ขอนแก่น",
    postalCode: "40000",
  },
  {
    subDistrict: "ปัว",
    district: "ปัว",
    province: "น่าน",
    postalCode: "55120",
  },
  {
    subDistrict: "เกาะลันตาใหญ่",
    district: "เกาะลันตา",
    province: "กระบี่",
    postalCode: "81150",
  },
  {
    subDistrict: "เกาะกูด",
    district: "เกาะกูด",
    province: "ตราด",
    postalCode: "23000",
  },
  {
    subDistrict: "อ่างทอง",
    district: "เกาะสมุย",
    province: "สุราษฎร์ธานี",
    postalCode: "84140",
  },
  {
    subDistrict: "บ้านเกาะ",
    district: "พระนครศรีอยุธยา",
    province: "พระนครศรีอยุธยา",
    postalCode: "13000",
  },
  {
    subDistrict: "ลุ่มสุ่ม",
    district: "ไทรโยค",
    province: "กาญจนบุรี",
    postalCode: "71150",
  },
];

// Helper สำหรับสุ่มข้อมูล
const getRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]!;
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = () => new Date(Date.now() - getRandomInt(0, 10000000000));

async function main() {
  console.log("Start seeding ...");

  // --- 2. Master Data (Roles, Tags, Banners) ---

  // Roles
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

  // Tags (20+)
  const tagData = Array.from({ length: 25 }).map((_, i) => ({
    name: `Tag-${i + 1}-${
      ["Nature", "Culture", "Food", "Adventure", "Relax"][i % 5]
    }`,
  }));
  await prisma.tag.createMany({ data: tagData });
  const allTags = await prisma.tag.findMany();

  // Banners (20+)
  await prisma.banner.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      image: "uploads/store1.jpg",
    })),
  });

  // --- 3. Users & Locations (Foundation for Communities) ---

  // Locations (100+ เพื่อกระจายใช้)
  const locationInputs = Array.from({ length: 100 }).map((_, i) => {
    const loc = getRandom(realLocations);
    return {
      detail: `รายละเอียดที่อยู่จำลอง ${i + 1}`,
      houseNumber: `${getRandomInt(1, 999)}/${getRandomInt(1, 20)}`,
      subDistrict: loc.subDistrict,
      district: loc.district,
      province: loc.province,
      postalCode: loc.postalCode,
      latitude: 13.0 + Math.random() * 5,
      longitude: 100.0 + Math.random() * 5,
    };
  });
  // createMany does not return IDs easily in all DBs, so loop create or findMany after
  // แต่เพื่อความง่ายในการ link ID เราจะ create ทีละอันหรือ query กลับมา
  // เนื่องจาก createMany ของ prisma ไม่ return ids ใน mysql เราจะใช้วิธีวน loop create
  // (อาจจะช้าหน่อยแต่ชัวร์เรื่อง ID สำหรับ seed file)
  const locationIds: number[] = [];
  for (const loc of locationInputs) {
    const l = await prisma.location.create({ data: loc });
    locationIds.push(l.id);
  }

  // Users (30+ คน ครบทุก Role)
  // Thai Names Data
  const thaiFirstNames = [
    "สมชาย",
    "สมศรี",
    "ปราณี",
    "วินัย",
    "สุรพล",
    "กานดา",
    "มานะ",
    "มานี",
    "ชูใจ",
    "ปิติ",
    "วีระ",
    "สุดา",
    "อารี",
    "วิชัย",
    "ประภาส",
    "นภา",
    "ดรุณี",
    "ศักดิ์ชัย",
    "กมล",
    "จินตนา",
    "ณเดชน์",
    "ญาญ่า",
    "เวียร์",
    "เบลล่า",
    "โป๊ป",
    "มิว",
    "หมาก",
    "คิม",
    "เจมส์",
    "แต้ว",
  ];
  const thaiLastNames = [
    "ใจดี",
    "รักไทย",
    "มีสุข",
    "สุขใจ",
    "เจริญ",
    "มั่นคง",
    "ทองดี",
    "ศรีสุข",
    "วงศ์สวัสดิ์",
    "พัฒนพงศ์",
    "สุวรรณ",
    "จันทร์เพ็ญ",
    "รัตน",
    "ประเสริฐ",
    "สมบูรณ์",
    "ยั่งยืน",
    "มั่งคั่ง",
    "รุ่งเรือง",
    "กล้าหาญ",
    "ภักดี",
    "คูกิมิยะ",
    "เสปอร์บันด์",
    "ศุกลวัฒน์",
    "ราณี",
    "ธนวรรธน์",
    "นิษฐา",
    "ปริญ",
    "เบอร์ลี่",
    "จิรายุ",
    "ณฐพร",
  ];

  // Generate all possible unique name combinations
  const allNameCombinations: { fname: string; lname: string }[] = [];
  for (const fname of thaiFirstNames) {
    for (const lname of thaiLastNames) {
      allNameCombinations.push({ fname, lname });
    }
  }

  // Shuffle the combinations (Fisher-Yates shuffle)
  for (let i = allNameCombinations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allNameCombinations[i], allNameCombinations[j]] = [
      allNameCombinations[j]!,
      allNameCombinations[i]!,
    ];
  }

  const userIds = {
    superadmin: [] as number[],
    admin: [] as number[],
    member: [] as number[],
    tourist: [] as number[],
  };
  const hashPassword = bcrypt.hashSync("hashedpw", 10);
  for (let i = 0; i < 40; i++) {
    const roleKey = Object.keys(roleMap)[i % 4] as keyof typeof userIds;

    // Select unique Thai names from the shuffled list
    const { fname, lname } = allNameCombinations[i]!;

    const user = await prisma.user.create({
      data: {
        roleId: roleMap[roleKey],
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: hashPassword, // ตามโจทย์
        fname: fname,
        lname: lname,
        phone: `08${getRandomInt(10000000, 99999999)}`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        status: getRandom(Object.values(UserStatus)),
        birthDate: getRandomDate(),
      },
    });
    userIds[roleKey].push(user.id);
  }

  // --- 4. Communities (20+) ---
  const communities = [];
  for (let i = 0; i < communityNames.length; i++) {
    const adminId = getRandom(userIds.admin); // สุ่ม admin มาดูแล
    const locId = locationIds[i]!; // ใช้ location ตามลำดับ

    const comm = await prisma.community.create({
      data: {
        name: communityNames[i]!,
        type: "วิสาหกิจชุมชน",
        locationId: locId,
        adminId: adminId,
        registerNumber: `SMCE-${getRandomInt(1000, 9999)}-${i}`,
        registerDate: getRandomDate(),
        description: `รายละเอียดเกี่ยวกับ${communityNames[i]} แหล่งท่องเที่ยววิถีชุมชน`,
        bankName: "ธนาคารกรุงไทย",
        accountName: `บัญชี ${communityNames[i]}`,
        accountNumber: `${getRandomInt(1000000000, 9999999999)}`,
        mainActivityName: "ท่องเที่ยวเชิงเกษตร",
        mainActivityDescription: "ชมสวน เก็บผลไม้ เรียนรู้วิถีชีวิต",
        status: CommunityStatus.OPEN,
        phone: `09${getRandomInt(10000000, 99999999)}`,
        rating: getRandomInt(3, 5) + Math.random(),
        isRatingVisible: true,
        email: `contact${i}@smce.com`,
        mainAdmin: `admin ${i}`,
        mainAdminPhone: `08${getRandomInt(10000000, 99999999)}`,
        // Relations
        communityImage: {
          create: [
            { image: "uploads/store1.jpg", type: ImageType.COVER },
            { image: "uploads/store1.jpg", type: ImageType.GALLERY },
          ],
        },
        communityMembers: {
          create: [
            { memberId: getRandom(userIds.member) },
            { memberId: getRandom(userIds.member) },
          ],
        },
      },
    });
    communities.push(comm);
  }

  // --- 5. Stores (20+) ---
  // กระจาย Store ไปยัง Community ต่างๆ
  for (let i = 0; i < 25; i++) {
    const comm = getRandom(communities);
    await prisma.store.create({
      data: {
        name: `ร้านค้าชุมชน ${i + 1} ของ ${comm.name}`,
        detail: "จำหน่ายสินค้า OTOP และของที่ระลึกประจำท้องถิ่น",
        communityId: comm.id,
        locationId: getRandom(locationIds),
        storeImage: {
          create: { image: "uploads/store1.jpg", type: ImageType.COVER },
        },
        tagStores: {
          create: { tagId: getRandom(allTags).id },
        },
      },
    });
  }

  // --- 6. Homestays (20+) ---
  const homestays = [];
  for (let i = 0; i < 25; i++) {
    const comm = getRandom(communities);
    const hs = await prisma.homestay.create({
      data: {
        name: `โฮมสเตย์บ้าน ${i + 1}`,
        communityId: comm.id,
        locationId: getRandom(locationIds),
        type: getRandom(["เรือนไทย", "บ้านปูน", "กระท่อมไม้ไผ่"]),
        guestPerRoom: getRandomInt(2, 4),
        totalRoom: getRandomInt(1, 5),
        facility: "แอร์, Wifi, เครื่องทำน้ำอุ่น",
        homestayImage: {
          create: {
            image: "uploads/store1.jpg",
            type: ImageType.COVER,
          },
        },
        tagHomestays: {
          create: { tagId: getRandom(allTags).id },
        },
      },
    });
    homestays.push(hs);
  }

  // --- 7. Packages (20+) ---
  const packages = [];
  for (let i = 0; i < 25; i++) {
    const comm = getRandom(communities);
    const creator = userIds.admin[0]!; // สมมติให้ admin คนแรกสร้าง
    const overseer = getRandom(userIds.member); // ให้ member สักคนดูแล

    const pk = await prisma.package.create({
      data: {
        name: `แพ็คเกจท่องเที่ยว ${comm.name} ${i + 1} วัน`,
        communityId: comm.id,
        locationId: getRandom(locationIds),
        createById: creator,
        overseerMemberId: overseer,
        description: "สัมผัสวิถีชีวิต ดำนา เกี่ยวข้าว ทานอาหารพื้นถิ่น",
        capacity: getRandomInt(10, 30),
        price: getRandomInt(500, 3000),
        warning: "ควรเตรียมชุดลุยโคลนมาด้วย",
        statusPackage: getRandom(Object.values(PackagePublishStatus)),
        statusApprove: getRandom(Object.values(PackageApproveStatus)),
        startDate: new Date(),
        dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        facility: "รถรับส่ง, อาหาร 3 มื้อ, วิทยากร",
        packageFile: {
          create: [
            { filePath: "uploads/store1.jpg", type: ImageType.COVER },
            { filePath: "uploads/store1.jpg", type: ImageType.VIDEO },
          ],
        },
        tagPackages: {
          create: { tagId: getRandom(allTags).id },
        },
      },
    });
    packages.push(pk);
  }

  // --- 8. Bookings & History & Feedback (20+) ---
  for (let i = 0; i < 30; i++) {
    const touristId = getRandom(userIds.tourist);
    const pkg = getRandom(packages);
    const status = getRandom(Object.values(BookingStatus));

    // สร้าง Booking
    const booking = await prisma.bookingHistory.create({
      data: {
        touristId: touristId,
        packageId: pkg.id,
        bookingAt: getRandomDate(),
        status: status,
        totalParticipant: getRandomInt(1, 5),
        transferSlip: status === BookingStatus.BOOKED ? "slip.jpg" : null,
      },
    });

    // ถ้าจองสำเร็จ ให้สร้าง HomestayHistory ด้วย (สมมติว่าแพ็คเกจนี้มีโฮมสเตย์)
    if (status === BookingStatus.BOOKED) {
      await prisma.homestayHistory.create({
        data: {
          packageId: pkg.id,
          homestayId: getRandom(homestays).id,
          bookedRoom: 1,
          checkInTime: new Date(),
          checkOutTime: new Date(new Date().setDate(new Date().getDate() + 1)),
        },
      });

      // สร้าง Feedback สำหรับ Booking ที่สำเร็จ
      await prisma.feedback.create({
        data: {
          bookingHistoryId: booking.id,
          createdAt: new Date(),
          message: "ประทับใจมากครับ อาหารอร่อย บรรยากาศดี",
          rating: getRandomInt(4, 5),
          feedbackImages: {
            create: { image: "/uploads/store1.jpg" },
          },
          // จำลองการตอบกลับ
          responderId: userIds.admin[0]!,
          replyMessage: "ขอบคุณมากครับ โอกาสหน้าเชิญใหม่นะครับ",
          replyAt: new Date(),
        },
      });
    }
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
