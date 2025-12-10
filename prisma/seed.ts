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

// Helper สำหรับสุ่มข้อมูล
/**
 * ชื่อฟังก์ชัน: getRandom
 * คำอธิบาย: สุ่มเลือกข้อมูล 1 รายการจากอาเรย์ที่กำหนด
 * Input: arr (อาเรย์ของข้อมูลชนิด T)
 * Output: ข้อมูลชนิด T ที่สุ่มได้
 */
const getRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)]!;
/**
 * ชื่อฟังก์ชัน: getRandomInt
 * คำอธิบาย: สุ่มตัวเลขจำนวนเต็มในช่วงที่กำหนด
 * Input: min (ค่าน้อยสุด), max (ค่ามากสุด)
 * Output: ตัวเลขจำนวนเต็มที่สุ่มได้
 */
const getRandomInt = (minimum: number, maximum: number) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
/**
 * ชื่อฟังก์ชัน: getRandomDate
 * คำอธิบาย: สุ่มวันที่ย้อนหลังไม่เกินประมาณ 115 วัน
 * Input: -
 * Output: วันที่ (Date) ที่สุ่มได้
 */
const getRandomDate = () => new Date(Date.now() - getRandomInt(0, 10000000000));
/**
 * ชื่อฟังก์ชัน: getRandomRecentDate
 * คำอธิบาย: สุ่มวันที่ย้อนหลังไม่เกิน 7 วัน
 * Input: -
 * Output: วันที่ (Date) ที่สุ่มได้
 */
const getRandomRecentDate = () =>
  new Date(Date.now() - getRandomInt(0, 7 * 24 * 60 * 60 * 1000));

/**
 * ชื่อฟังก์ชัน: main
 * คำอธิบาย: ฟังก์ชันหลักสำหรับรันกระบวนการ Seed ข้อมูลลงฐานข้อมูล
 * Input: -
 * Output: Promise<void>
 */
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
    superadmin: roles.find((role) => role.name === "superadmin")!.id,
    admin: roles.find((role) => role.name === "admin")!.id,
    member: roles.find((role) => role.name === "member")!.id,
    tourist: roles.find((role) => role.name === "tourist")!.id,
  };

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
  ];

  // Tags (Use predefined Thai tags)
  const tagData = thaiTags.map((name) => ({ name }));
  await prisma.tag.createMany({ data: tagData });
  const allTags = await prisma.tag.findMany();

  // Banners (20+)
  await prisma.banner.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      image: "uploads/store1.jpg",
    })),
  });

  const locationInputs = Array.from({ length: 100 }).map((_, i) => {
    const location = getRandom(realLocations);
    return {
      detail: `รายละเอียดที่อยู่จำลอง ${i + 1}`,
      houseNumber: `${getRandomInt(1, 999)}/${getRandomInt(1, 20)}`,
      subDistrict: location.subDistrict,
      district: location.district,
      province: location.province,
      postalCode: location.postalCode,
      latitude: 13.0 + Math.random() * 5,
      longitude: 100.0 + Math.random() * 5,
    };
  });

  const locationIds: number[] = [];
  for (const locationInput of locationInputs) {
    const createdLocation = await prisma.location.create({
      data: locationInput,
    });
    locationIds.push(createdLocation.id);
  }

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

  const allNameCombinations: { firstName: string; lastName: string }[] = [];
  for (const firstName of thaiFirstNames) {
    for (const lastName of thaiLastNames) {
      allNameCombinations.push({ firstName, lastName });
    }
  }

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
  const roleCounters = {
    superadmin: 0,
    admin: 0,
    member: 0,
    tourist: 0,
  };

  for (let i = 0; i < 10; i++) {
    const roleKey = Object.keys(roleMap)[i % 4] as keyof typeof userIds;
    roleCounters[roleKey]++;

    const { firstName, lastName } = allNameCombinations[i]!;

    const user = await prisma.user.create({
      data: {
        roleId: roleMap[roleKey],
        username: `${roleKey}_${roleCounters[roleKey]}`,
        email: `${roleKey}_${roleCounters[roleKey]}@example.com`,
        password: hashPassword, // ตามโจทย์
        fname: firstName,
        lname: lastName,
        phone: `08${getRandomInt(10000000, 99999999)}`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        status: getRandom(Object.values(UserStatus)),
        birthDate: getRandomDate(),
      },
    });
    userIds[roleKey].push(user.id);
  }

  const communityAdminIds: number[] = [];
  for (let i = 0; i < communityNames.length; i++) {
    const { firstName, lastName } = allNameCombinations[10 + i]!; // Continue from previous loop
    const user = await prisma.user.create({
      data: {
        roleId: roleMap.admin,
        username: `comm_admin_${i + 1}`,
        email: `comm_admin_${i + 1}@example.com`,
        password: hashPassword,
        fname: firstName,
        lname: lastName,
        phone: `08${getRandomInt(10000000, 99999999)}`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        status: UserStatus.ACTIVE,
        birthDate: getRandomDate(),
      },
    });
    communityAdminIds.push(user.id);
  }

  const communityMemberIds: number[] = [];
  for (let i = 0; i < communityNames.length; i++) {
    const { firstName, lastName } = allNameCombinations[35 + i]!;
    const user = await prisma.user.create({
      data: {
        roleId: roleMap.member,
        username: `comm_member_${i + 1}`,
        email: `comm_member_${i + 1}@example.com`,
        password: hashPassword,
        fname: firstName,
        lname: lastName,
        phone: `08${getRandomInt(10000000, 99999999)}`,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        status: UserStatus.ACTIVE,
        birthDate: getRandomDate(),
      },
    });
    communityMemberIds.push(user.id);
  }

  const communities = [];
  for (let i = 0; i < communityNames.length; i++) {
    const adminId = communityAdminIds[i]!; // Unique admin for this community
    const locationId = locationIds[i]!; // ใช้ location ตามลำดับ

    const community = await prisma.community.create({
      data: {
        name: communityNames[i]!,
        type: "วิสาหกิจชุมชน",
        locationId: locationId,
        adminId: adminId,
        registerNumber: `SMCE-${getRandomInt(1000, 9999)}-${i}`,
        registerDate: getRandomDate(),
        description: `รายละเอียดเกี่ยวกับ${communityNames[i]} แหล่งท่องเที่ยววิถีชุมชน`,
        bankName: "ธนาคารกรุงไทย",
        accountName: `บัญชี ${communityNames[i]!.substring(0, 35)}`,
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
        communityImage: {
          create: [
            { image: "uploads/store1.jpg", type: ImageType.COVER },
            { image: "uploads/store1.jpg", type: ImageType.GALLERY },
          ],
        },
        communityMembers: {
          create: [
            { memberId: communityMemberIds[i]! }, // Assign the unique member
          ],
        },
      },
    });
    communities.push(community);
  }

  for (const community of communities) {
    await prisma.store.create({
      data: {
        name: `ร้านค้าชุมชน ${getRandom(["ขนม", "บ้านปูน", "กระท่อมไม้ไผ่"])}`,
        detail: "จำหน่ายสินค้า OTOP และของที่ระลึกประจำท้องถิ่น",
        communityId: community.id,
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

  const homestays = [];
  for (const community of communities) {
    const homestay = await prisma.homestay.create({
      data: {
        name: `โฮมสเตย์ ${getRandom(["เรือนไทย", "บ้านปูน", "กระท่อมไม้ไผ่"])}`,
        communityId: community.id,
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
    homestays.push(homestay);
  }

  const packages = [];
  for (const community of communities) {
    const creator = community.adminId; // Use the community's admin
    const overseer = getRandom(userIds.member); // ให้ member สักคนดูแล

    for (const status of Object.values(PackageApproveStatus)) {
      const createdPackage = await prisma.package.create({
        data: {
          name: getRandom(packageNames),
          communityId: community.id,
          locationId: getRandom(locationIds),
          createById: creator!,
          overseerMemberId: overseer,
          description: "สัมผัสวิถีชีวิต ดำนา เกี่ยวข้าว ทานอาหารพื้นถิ่น",
          capacity: getRandomInt(10, 30),
          price: getRandomInt(500, 3000),
          warning: "ควรเตรียมชุดลุยโคลนมาด้วย",
          statusPackage: PackagePublishStatus.PUBLISH,
          statusApprove: status,
          rejectReason:
            status === PackageApproveStatus.REJECTED
              ? "ข้อมูลไม่ครบถ้วน"
              : null,
          startDate: new Date(),
          dueDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
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
      packages.push(createdPackage);
    }

    const draftPackage = await prisma.package.create({
      data: {
        name: getRandom(packageNames),
        communityId: community.id,
        locationId: getRandom(locationIds),
        createById: creator!,
        overseerMemberId: overseer,
        description: "แพ็กเกจร่าง ยังไม่เผยแพร่",
        capacity: getRandomInt(10, 30),
        price: getRandomInt(500, 3000),
        warning: null,
        statusPackage: PackagePublishStatus.DRAFT,
        statusApprove: null,
        startDate: new Date(),
        dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        facility: "รถรับส่ง",
        packageFile: {
          create: [{ filePath: "uploads/store1.jpg", type: ImageType.COVER }],
        },
        tagPackages: {
          create: { tagId: getRandom(allTags).id },
        },
      },
    });
    packages.push(draftPackage);
  }

  for (const packageItem of packages) {
    for (const status of Object.values(BookingStatus)) {
      const touristId = getRandom(userIds.tourist);

      const booking = await prisma.bookingHistory.create({
        data: {
          touristId: touristId,
          packageId: packageItem.id,
          bookingAt: getRandomRecentDate(),
          status: status,
          totalParticipant: getRandomInt(1, 5),
          transferSlip: ["PENDING", "REJECTED"].includes(status)
            ? null
            : "slip.jpg",
          rejectReason: ["REJECTED", "REFUND_REJECTED"].includes(status)
            ? "สลิปไม่ถูกต้อง"
            : null,
        },
      });

      if (status === BookingStatus.BOOKED) {
        await prisma.homestayHistory.create({
          data: {
            packageId: packageItem.id,
            homestayId: getRandom(homestays).id,
            bookedRoom: 1,
            checkInTime: new Date(),
            checkOutTime: new Date(
              new Date().setDate(new Date().getDate() + 1)
            ),
          },
        });

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
  }

  console.log("Seeding finished.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
