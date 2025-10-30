import fs from "fs";
/**
 * ดึงข้อมูลธนาคารทั้งหมดจากไฟล์ banks.json
 * input: ไม่มี
 * output: ชื่อธนาคารในรูปแบบอาเรย์ของอ็อบเจ็กต์
 */
export function getAllBanks() {
  const filePath = "src/Services/bank/banks.json";
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}
