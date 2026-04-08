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

const packageImages = [
  "pkg_craft_indigo.jpg",
  "pkg_nature_sakura.jpg",
  "pkg_culture_namchio.jpg",
  "activity_cooking.jpg",
  "activity_kayak.jpg",
  "activity_farming.jpg",
  "activity_pottery.jpg",
  "activity_rafting.jpg",
  "pkg_rafting.jpg",
  "pkg_pottery.jpg",
  "pkg_farming.jpg",
  "pkg_kayak.jpg",
  "pkg_camping.jpg",
];

const communityImages = [
  "ce_indigo_dyeing.jpg",
  "ce_local_snack.jpg",
  "ce_bamboo_basket.jpg",
  "ce_organic_farm.jpg",
  "ce_community_coffee.jpg",
  "ce_herbal_product.jpg",
  "ce_pottery_craft.jpg",
  "ce_community_rice.jpg",
  "ce_dried_seafood.jpg",
  "ce_wild_honey.jpg",
  "ce_natural_soap.jpg",
  "ce_salt_production.jpg",
  "ce_fruit_processing.jpg",
  "ce_community_tourism.jpg",
  "ce_silk_weaving.jpg",
];

const bannerImages = [
  "banner_village.jpg",
  "banner_nature.jpg",
  "banner_craft.jpg",
  "banner_food.jpg",
  "banner_activity.jpg",
];

const packageDescription = [
  "สัมผัสประสบการณ์การเรียนรู้ศิลปะการมัดย้อมครามธรรมชาติ ณ บ้านคำข่า จังหวัดสกลนคร ที่ซึ่งคุณจะได้ลงมือทำตั้งแต่ขั้นตอนการเตรียมน้ำครามจากต้นครามสดๆ ไปจนถึงการออกแบบลวดลายที่เป็นเอกลักษณ์เฉพาะตัวบนผืนผ้าฝ้ายเนื้อนุ่ม เรียนรู้ภูมิปัญญาชาวบ้านที่สืบทอดกันมาหลายชั่วอายุคน และทำความเข้าใจถึงความสำคัญของสีกรมท่าที่ได้จากธรรมชาติอย่างแท้จริง นอกจากจะได้ผ้าที่สวยงามกลับบ้านแล้ว คุณยังจะได้ความภาคภูมิใจในผลงานแฮนด์เมดที่ใส่ใจในทุกรายละเอียดและเป็นมิตรต่อสิ่งแวดล้อมอย่างที่สุด",
  "เดินทางขึ้นสู่ยอดดอยบ้านร่องกล้าเพื่อชมความงดงามของดอกนางพญาเสือโคร่งหรือซากุระเมืองไทยที่จะบานสะพรั่งเปลี่ยนทั้งหุบเขาให้เป็นสีชมพูในช่วงฤดูหนาว แพ็กเกจนี้จะพาคุณไปสัมผัสอากาศที่เย็นสบายตลอดทั้งปี เรียนรู้วิถีชีวิตและความเชื่อของชาวไทยภูเขาเผ่าม้งที่อยู่ร่วมกับผืนป่าอย่างกลมกลืน พร้อมทั้งถ่ายภาพในจุดเช็คอินสุดประทับใจที่ไม่เหมือนใคร นอกจากจะได้ชมดอกไม้สวยๆ แล้ว ยังมีโอกาสได้ลิ้มรสอาหารพื้นเมืองร้อนๆ ท่ามกลางบรรยากาศไอหมอกยามเช้าที่จะทำให้ทริปนี้เป็นความทรงจำที่แสนพิเศษสำหรับคุณ",
  "เปิดตำนานวิถีชีวิตชุมชนบ้านน้ำเชี่ยว แหล่งท่องเที่ยวเชิงวัฒนธรรมที่รวมความหลากหลายของ 2 ศาสนาและ 3 วัฒนธรรมไว้ด้วยกันอย่างลงตัว คุณจะได้ล่องเรือชมความอุดมสมบูรณ์ของป่าชายเลนและวิถีประมงพื้นบ้าน พร้อมร่วมกิจกรรมทำขนมตังเมกรอบ ขนมโบราณที่เป็นเอกลักษณ์ของชุมชน เรียนรู้การทำงอบน้ำเชี่ยวที่เป็นงานหัตถกรรมอันทรงคุณค่า และดื่มด่ำกับบรรยากาศการต้อนรับที่อบอุ่นจากคนในชุมชนที่พร้อมจะแบ่งปันเรื่องราวความรักและความสามัคคีผ่านวิถีชีวิตริมน้ำที่สงบสุข",
  "เปิดครัวชุมชนต้อนรับนักท่องเที่ยวที่หลงใหลในรสชาติอาหารพื้นถิ่น กับคอร์สเรียนทำอาหารที่เริ่มตั้งแต่การพาคุณเดินลุยสวนสมุนไพรเพื่อเก็บวัตถุดิบสดๆ ด้วยมือตัวเอง นำมาปรุงเมนูเด็ดตามสูตรลับที่ตกทอดกันมาในครอบครัว เรียนรู้เคล็ดลับการใช้เครื่องเทศท้องถิ่นที่ทั้งมีรสชาติเป็นเอกลักษณ์และเป็นยาบำรุงธาตุตามภูมิปัญญาไทย คุณจะได้สัมผัสความสนุกสนานในการลงมือทำทุกขั้นตอน ตั้งแต่การโขลกเครื่องแกงไปจนถึงการจัดจานอาหารให้สวยงามน่ารับประทาน พร้อมล้อมวงทานมื้อพิเศษนี้ร่วมกับเพื่อนใหม่ในบรรยากาศสวนหลังบ้าน",
  "ผจญภัยไปกับกิจกรรมพายเรือคายัคสำรวจความมหัศจรรย์ของระบบนิเวศป่าชายเลน ล่องผ่านอุโมงค์ต้นโกงกางที่แผ่กิ่งก้านปกคลุมราวกับซุ้มประตูธรรมชาติที่สวยงาม ตื่นตากับการสังเกตสิ่งมีชีวิตตัวเล็กๆ เช่น ปลาตีนและปูก้ามดาบที่อาศัยอยู่ตามรากไม้ แพ็กเกจนี้ออกแบบมาเพื่อให้คุณได้ใกล้ชิดกับธรรมชาติในมุมมองใหม่ที่เงียบสงบและเป็นมิตรต่อสิ่งแวดล้อม พร้อมรับความรู้เกี่ยวกับการอนุรักษ์ทรัพยากรชายฝั่งจากไกด์ท้องถิ่นผู้เชี่ยวชาญ เป็นกิจกรรมที่ช่วยสร้างความตื่นเต้นและมอบความผ่อนคลายไปพร้อมๆ กัน",
  "สลัดคราบคนเมืองมาสวมชุดหม้อห้อมเพื่อสัมผัสวิถีชีวิตชาวนาไทยอย่างแท้จริง ในกิจกรรมเรียนรู้การทำเกษตรอินทรีย์แบบครบวงจร ตั้งแต่ขั้นตอนการเพาะกล้า การเตรียมดิน จนถึงการลงแขกเกี่ยวข้าวท่ามกลางบรรยากาศท้องทุ่งนาที่กว้างขวางและลมพัดเย็นสบาย คุณจะได้เรียนรู้ความสำคัญของข้าวไทยที่เป็นหัวใจของคนในชาติ พร้อมสนุกกับการทดลองทำปุ๋ยหมักจากธรรมชาติและวิถีเกษตรพอเพียงที่สามารถนำไปปรับใช้ในชีวิตประจำวันได้จริง เป็นช่วงเวลาที่จะทำให้คุณเห็นคุณค่าของอาหารทุกคำและธรรมชาติรอบตัวมากขึ้น",
  "ย้อนเวลากลับไปสู่ยุคก่อนประวัติศาสตร์ด้วยการลงมือทำกิจกรรมปั้นหม้อดินเผาแบบบ้านเชียง เรียนรู้เทคนิคการขึ้นรูปดินด้วยมือและเครื่องหมุนไม้ตามแบบฉบับดั้งเดิม ฝึกทักษะการเขียนลวดลายก้นหอยและสีแดงอันเป็นเอกลักษณ์ที่มีชื่อเสียงโด่งดังไปทั่วโลก แพ็กเกจนี้จะพาคุณเจาะลึกถึงเบื้องหลังของมรดกโลกทางวัฒนธรรม พร้อมรับฟังเรื่องราวความเชื่อและวิถีชีวิตของบรรพบุรุษผ่านลวดลายบนภาชนะดินเผา นอกจากความเพลิดเพลินในการสร้างสรรค์งานศิลปะแล้ว คุณยังจะได้ผลงานชิ้นเอกที่มีเพียงชิ้นเดียวในโลกกลับไปเป็นของที่ระลึกที่น่าภาคภูมิใจ",
  "พักผ่อนหย่อนใจไปกับการล่องแพไม้ไผ่แบบสโลว์ไลฟ์ ปล่อยให้สายน้ำไหลเอื่อยพาร่างกายของคุณผ่านหุบเขาและผืนป่าที่อุดมสมบูรณ์ ฟังเสียงธรรมชาติรอบตัวและสัมผัสความเย็นฉ่ำของลำน้ำที่ไหลผ่าน แพ็กเกจนี้เน้นการพักผ่อนอย่างแท้จริงเพื่อให้คุณได้ดีท็อกซ์จากความวุ่นวายในเมืองหลวง คุณจะได้สัมผัสวิถีการนำแพไม้ไผ่โดยพรานป่าผู้ชำนาญการที่พร้อมจะเล่าเรื่องราวความลับของป่าไม้ให้คุณฟังตลอดทาง เป็นช่วงเวลาแห่งความสงบที่จะช่วยฟื้นฟูพลังกายและพลังใจของคุณให้กลับมาเต็มเปี่ยมอีกครั้ง",
  "สัมผัสความงามของสายน้ำในมุมมองที่ต่างออกไปกับการล่องแพชมธรรมชาติริมฝั่งน้ำที่โอบล้อมด้วยภูเขาหินปูนและแมกไม้นานาพันธุ์ กิจกรรมนี้จะพาคุณไปพบกับจุดแวะพักที่น่าตื่นเต้น เช่น ถ้ำริมน้ำหรือจุดกระโดดน้ำที่ใสสะอาด แพ็กเกจนี้รวมอาหารถิ่นเลิศรสที่เสิร์ฟบนแพให้คุณได้อิ่มอร่อยท่ามกลางทัศนียภาพที่สวยงามระดับโลก เรียนรู้วิถีชีวิตของชุมชนริมน้ำที่ผูกพันกับสายน้ำมาอย่างยาวนาน และร่วมถ่ายภาพความประทับใจกับวิวน้ำตกที่สวยงามระหว่างการเดินทาง เป็นทริปที่ตอบโจทย์ทั้งความชิลล์และความสนุกในเวลาเดียวกัน",
  "คอร์สเรียนปั้นดินเผาเชิงสร้างสรรค์ที่ผสมผสานระหว่างงานฝีมือดั้งเดิมและดีไซน์สมัยใหม่ คุณจะได้เรียนรู้วิธีการคัดเลือกดินจากธรรมชาติ การนวดดินให้พร้อมใช้งาน และการสร้างรูปทรงที่แปลกตาตามจินตนาการของคุณเอง ภายใต้การดูแลอย่างใกล้ชิดจากศิลปินท้องถิ่น แพ็กเกจนี้เหมาะสำหรับทุกเพศทุกวัยที่ต้องการฝึกสมาธิและใช้เวลาว่างให้เกิดประโยชน์ผ่านงานศิลปะ นอกจากจะได้เรียนรู้ขั้นตอนการเผาเครื่องปั้นดินเผาเบื้องต้นแล้ว คุณยังจะได้แลกเปลี่ยนประสบการณ์กับเพื่อนร่วมคลาสที่มีใจรักในงานแฮนด์เมดในบรรยากาศสตูดิโอที่เป็นกันเอง",
  "เข้าร่วมโปรแกรมท่องเที่ยวเชิงเกษตรที่จะพาคุณไปเรียนรู้การจัดการสวนผลไม้และไร่นาสวนผสมตามหลักเกษตรทฤษฎีใหม่ สนุกกับกิจกรรมการเก็บผลไม้ตามฤดูกาลจากต้น สัมผัสรสชาติความสดใหม่ที่ไม่สามารถหาได้จากที่ไหน พร้อมร่วมทำเวิร์กชอปแปรรูปผลผลิตทางการเกษตร เช่น การทำน้ำผลไม้สกัดเย็นหรือผลไม้อบแห้ง แพ็กเกจนี้จะทำให้คุณเข้าใจถึงความใส่ใจของเกษตรกรในการดูแลพืชพันธุ์แต่ละต้นจนถึงวันเก็บเกี่ยว มอบประสบการณ์การเรียนรู้ที่เต็มไปด้วยรอยยิ้มและความรู้ที่จะเปลี่ยนมุมมองที่คุณมีต่ออาชีพเกษตรกรไปตลอดกาล",
  "ล่องเรือคายัคในเส้นทางสายลับที่จะพาคุณเข้าสู่ใจกลางผืนป่าที่ลึกลับและสวยงามที่สุดในชุมชน สัมผัสความเงียบสงบที่หาได้ยากในโลกภายนอก โดยมีเพียงเสียงพายกระทบน้ำและเสียงนกร้องเป็นเพื่อนร่วมทาง กิจกรรมนี้เน้นการถ่ายภาพธรรมชาติในจังหวะของแสงเช้าและแสงเย็นที่ตกกระทบผิวน้ำอย่างงดงาม แพ็กเกจนี้เตรียมอุปกรณ์รักษาความปลอดภัยไว้อย่างครบครัน พร้อมไกด์ที่จะช่วยนำทางไปยังจุดชมวิวที่เข้าถึงได้ยากแต่คุ้มค่ากับการมองเห็น เป็นโอกาสดีที่จะได้เก็บภาพความทรงจำที่ล้ำค่าและสัมผัสความมหัศจรรย์ของธรรมชาติอย่างแท้จริง",
  "หลีกหนีความวุ่นวายมาพักผ่อนในแคมป์ปิ้งส่วนตัวบนยอดดอยที่โอบล้อมด้วยแสงดาว แพ็กเกจนี้จัดเตรียมเต็นท์และอุปกรณ์พักแรมที่สะดวกสบายไว้ให้คุณเรียบร้อยแล้ว กิจกรรมไฮไลท์คือการร่วมวงล้อมกองไฟ ปิ้งย่างอาหารพื้นเมืองรสเด็ด และนอนชมกลุ่มดาวที่ชัดเจนที่สุดแห่งหนึ่งในประเทศไทยท่ามกลางอากาศหนาวเย็น ตื่นเช้ามารับแสงแรกของวันพร้อมจิบกาแฟสดท่ามกลางทะเลหมอกที่ไหลผ่านหน้าเต็นท์ เป็นประสบการณ์การพักผ่อนแบบผจญภัยที่ผสมผสานความเรียบง่ายเข้ากับความงดงามของธรรมชาติได้อย่างลงตัวที่สุด"
];

const facilities = [
  "ที่จอดรถกว้างขวาง ปลอดภัยสำหรับรถยนต์ส่วนตัวและรถบัส",
  "ห้องน้ำและห้องสุขาสะอาด แยกชาย-หญิง พร้อมจุดบริการล้างมือ",
  "จุดบริการน้ำดื่มสะอาดฟรีตามจุดพักและพื้นที่ทำกิจกรรม",
  "ชุดปฐมพยาบาลเบื้องต้นและเจ้าหน้าที่ที่ผ่านการฝึกอบรมการกู้ชีพ",
  "พื้นที่พักผ่อนส่วนกลางและศาลาชมวิวบรรยากาศธรรมชาติ",
  "อินเทอร์เน็ตไร้สาย (Free Wi-Fi) บริเวณจุดประชาสัมพันธ์และที่พัก",
  "เสื้อชูชีพ อุปกรณ์ป้องกันความปลอดภัย และหมวกนิรภัยครบชุด",
  "ตู้ล็อกเกอร์สำหรับเก็บสัมภาระและของมีค่าส่วนตัว",
  "ห้องผลัดเปลี่ยนเสื้อผ้าและห้องอาบน้ำพร้อมสบู่-แชมพู",
  "มัคคุเทศก์ท้องถิ่นผู้เชี่ยวชาญ คอยให้ความรู้และดูแลตลอดทริป",
  "บริการรถรับ-ส่งจากจุดนัดพบไปยังพื้นที่ทำกิจกรรมต่างๆ",
  "ร้านอาหารชุมชนรสชาติดั้งเดิมและคาเฟ่เครื่องดื่มสมุนไพร",
  "ร้านจำหน่ายของที่ระลึก สินค้าแฮนด์เมด และผลิตภัณฑ์ชุมชน",
  "จุดบริการชาร์จไฟพกพาและปลั๊กพ่วงสำหรับอุปกรณ์อิเล็กทรอนิกส์",
  "บริการถ่ายภาพที่ระลึกและไฟล์ภาพจากช่างภาพท้องถิ่น",
  "อุปกรณ์กันแดดและฝน เช่น ร่ม หมวก และเสื้อกันฝน",
  "พื้นที่สูบบุหรี่ที่จัดไว้เฉพาะเพื่อรักษาสภาพแวดล้อม",
  "ระบบรักษาความปลอดภัยและการตรวจตราตลอด 24 ชั่วโมง",
  "ศูนย์ประชาสัมพันธ์ แผนที่ท่องเที่ยว และจุดให้ข้อมูลกิจกรรม",
  "ประกันอุบัติเหตุกลุ่มสำหรับนักท่องเที่ยวตามเงื่อนไขที่กำหนด"
];

const feedbacks = [
  "ประทับใจกิจกรรมมัดย้อมมากครับ คุณยายที่สอนเป็นกันเองมาก ได้ผ้าคลุมไหล่ฝีมือตัวเองกลับบ้าน ภูมิใจสุดๆ เลย",
  "บรรยากาศที่ดอยร่องกล้าสวยเหมือนอยู่ญี่ปุ่นเลยครับ อากาศหนาวสะใจมาก หมูกระทะตอนเย็นท่ามกลางสายหมอกคือที่สุด",
  "ชุมชนบ้านน้ำเชี่ยวน่ารักมาก ได้ลองทำขนมตังเมกรอบด้วย สนุกและอร่อยมาก เป็นประสบการณ์ที่ไม่เคยหาได้จากที่ไหน",
  "ชอบที่ได้ไปเก็บผักในสวนมาทำอาหารจริงๆ รสชาติพริกแกงที่โขลกเองกับมือเข้มข้นมาก ได้เคล็ดลับกลับมาทำกินที่บ้านด้วย",
  "พายเรือคายัคผ่านอุโมงค์โกงกางสวยจนลืมหายใจเลยค่ะ ไกด์ท้องถิ่นดูแลดีมาก ให้ความรู้เรื่องระบบนิเวศได้น่าสนใจจริงๆ",
  "พาลูกๆ ไปเรียนรู้การทำนา เด็กๆ ชอบมากครับ ได้สัมผัสโคลนและวิถีชาวนาจริงๆ เป็นการเรียนรู้นอกห้องเรียนที่คุ้มค่ามาก",
  "ตอนแรกคิดว่าการเขียนลายบ้านเชียงจะยาก แต่พอได้ลองทำแล้วสนุกและฝึกสมาธิได้ดีมาก ผลงานออกมาสวยกว่าที่คิดเยอะเลย",
  "เป็นการพักผ่อนที่แท้จริงค่ะ ล่องแพไม้ไผ่ปล่อยใจไปกับสายน้ำ ฟังเสียงนกเสียงไม้ ช่วยฮีลใจจากการทำงานได้ดีมาก",
  "อาหารที่เสิร์ฟบนแพอร่อยมาก วิวภูเขาหินปูนรอบๆ สวยระดับโลกจริงๆ ถ่ายรูปจนเมมโมรี่เต็มเลยค่ะทริปนี้",
  "ชอบบรรยากาศสตูดิโอปั้นดินเผาที่เป็นกันเองมาก ศิลปินสอนแบบไม่กั๊กเลย ได้ปลดปล่อยจินตนาการเต็มที่",
  "ผลไม้สดจากต้นหวานฉ่ำมากครับ ได้ความรู้เรื่องเกษตรทฤษฎีใหม่กลับมาเยอะเลย พี่ๆ เกษตรกรต้อนรับอบอุ่นมาก",
  "เส้นทางพายเรือคายัคสายลับสงบมากจริงๆ ค่ะ เหมาะสำหรับคนชอบถ่ายรูปธรรมชาติ แสงตอนเย็นที่กระทบผิวน้ำสวยมาก",
  "การแคมป์ปิ้งครั้งแรกที่ประทับใจที่สุด ดาวเต็มฟ้าและทะเลหมอกตอนเช้าสวยจนบรรยายไม่ถูก อุปกรณ์ทุกอย่างครบและสะดวกมาก",
  "ชอบความหลากหลายของวัฒนธรรมในชุมชน ทุกคนยิ้มแย้มแจ่มใสและพร้อมแบ่งปันเรื่องราว เป็นทริปที่อิ่มอกอิ่มใจมากครับ",
  "กิจกรรมแน่นแต่ไม่เหนื่อยจนเกินไป การจัดการดีมาก มีเจ้าหน้าที่ดูแลความปลอดภัยตลอดเวลา มั่นใจในการพาลูกหลานมาเที่ยวครับ"
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
  const bannerData = bannerImages.map((img) => ({
    image: `uploads/${img}`,
  }));

  await prisma.banner.createMany({
    data: bannerData,
  });

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
            { image: `uploads/${getRandom(communityImages)}`, type: ImageType.COVER },
            { image: `uploads/${getRandom(communityImages)}`, type: ImageType.GALLERY },
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
            name: getRandom(packageSeedNames),
            description: getRandom(packageDescription),
            capacity: 20,
            price: 1500,
            statusPackage: PackagePublishStatus.PUBLISH,
            statusApprove: PackageApproveStatus.APPROVE,
            startDate: getRandomDateFuture(),
            dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Year valid
            bookingOpenDate: new Date(),
            bookingCloseDate: getRandomDateFuture(),
            facility: getRandom(facilities),
            packageFile: {
              create: {
                filePath: `uploads/${getRandom(packageImages)}`,
                type: ImageType.COVER
              },
            },
            tagPackages: {
              create: allTags
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 3) + 2)
                .map((tag) => ({
                  tagId: tag.id,
                })),
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
            name: getRandom(packageSeedNames),
            description: getRandom(packageDescription),
            capacity: 20,
            price: 1500,
            statusPackage: PackagePublishStatus.DRAFT,
            statusApprove: PackageApproveStatus.PENDING,
            startDate: getRandomDateFuture(),
            dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            bookingOpenDate: new Date(),
            bookingCloseDate: getRandomDateFuture(),
            facility: getRandom(facilities),
            packageFile: {
              create: {
                filePath: `uploads/${getRandom(packageImages)}`,
                type: ImageType.COVER
              },
            },
            tagPackages: {
              create: allTags
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 3) + 2)
                .map((tag) => ({
                  tagId: tag.id,
                })),
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
          name: getRandom(packageSeedNames),
          statusPackage: PackagePublishStatus.PUBLISH,
          statusApprove: PackageApproveStatus.APPROVE,
          startDate: getRandomDatePast(),
          dueDate: getRandomDatePast(), // Already ended
          bookingOpenDate: getRandomDatePast(),
          bookingCloseDate: getRandomDatePast(),
          packageFile: {
            create: {
              filePath: `uploads/${getRandom(packageImages)}`,
              type: ImageType.COVER
            },
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
            message: getRandom(feedbacks),
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
        name: getRandom(packageSeedNames),
        description: "รอตรวจสอบ",
        price: 1000,
        statusPackage: PackagePublishStatus.PUBLISH,
        statusApprove: PackageApproveStatus.PENDING_SUPER,
        startDate: getRandomDateFuture(),
        dueDate: getRandomDateFuture(),
        // เปลี่ยนในส่วนสร้างแพ็กเกจร่าง
        packageFile: {
          create: {
            filePath: `uploads/${getRandom(packageImages)}`,
            type: ImageType.COVER
          },
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
