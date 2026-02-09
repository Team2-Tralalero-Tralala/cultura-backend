/*
 * คำอธิบาย : Service สำหรับจัดการ Configuration ของระบบ
 * ประกอบด้วยการอ่าน/เขียน config.json และการจัดการ server status
 * โดยจะสร้าง config.json จาก config.template.json หากไฟล์ไม่มีอยู่
 */
import fs from "fs";
import path from "path";

/*
 * Interface : ConfigData
 * คำอธิบาย : โครงสร้างข้อมูลของ config.json
 * Property:
 *   - serverOnline (boolean) : สถานะการทำงานของเซิร์ฟเวอร์
 */
export interface ConfigData {
  serverOnline: boolean;
}

/*
 * คำอธิบาย : ตรวจสอบและสร้าง config.json จาก config.template.json หากไม่มีอยู่
 * Output : void
 * Error : throw error หากไม่สามารถอ่านหรือเขียนไฟล์ได้
 */
function ensureConfigExists(): void {
  const configPath = path.join(process.cwd(), "config.json");
  const templatePath = path.join(process.cwd(), "config.template.json");

  if (!fs.existsSync(configPath)) {
    if (!fs.existsSync(templatePath)) {
      throw new Error("config.template.json not found");
    }
    
    try {
      fs.copyFileSync(templatePath, configPath);
      console.log("config.json created from config.template.json");
    } catch (error) {
      throw new Error(`Failed to create config.json: ${(error as Error).message}`);
    }
  }
}

/*
 * คำอธิบาย : อ่านข้อมูลจาก config.json
 * Output : ConfigData - ข้อมูล configuration
 * Error : throw error หากไม่สามารถอ่านไฟล์ได้
 */
export function readConfig(): ConfigData {
  ensureConfigExists();
  
  const configPath = path.join(process.cwd(), "config.json");
  
  try {
    const configData = fs.readFileSync(configPath, "utf8");
    return JSON.parse(configData) as ConfigData;
  } catch (error) {
    throw new Error(`Failed to read config.json: ${(error as Error).message}`);
  }
}

/*
 * คำอธิบาย : เขียนข้อมูลลงใน config.json
 * Input : config (ConfigData) - ข้อมูล configuration ที่ต้องการบันทึก
 * Output : void
 */
export function writeConfig(config: ConfigData): void {
  ensureConfigExists();
  
  const configPath = path.join(process.cwd(), "config.json");
  
  try {
    const configJson = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configJson, "utf8");
  } catch (error) {
    throw new Error(`Failed to write config.json: ${(error as Error).message}`);
  }
}

/*
 * คำอธิบาย : ดึงสถานะการทำงานของเซิร์ฟเวอร์
 * input : -
 * output : boolean - สถานะการทำงานของเซิร์ฟเวอร์
 */
export function getServerStatus(): boolean {
  const config = readConfig();
  return config.serverOnline;
}

/*
 * คำอธิบาย : ตั้งค่าสถานะการทำงานของเซิร์ฟเวอร์
 * Input : status (boolean) - สถานะที่ต้องการตั้งค่า
 * Output : void
 */
export function setServerStatus(status: boolean): void {
  const config = readConfig();
  config.serverOnline = status;
  writeConfig(config);
}
