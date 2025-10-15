/*
 * คำอธิบาย : ไฟล์นี้ใช้สำหรับกำหนด type ของ user
 * Input     : -
 * Output    : เพิ่ม property user ให้กับ Express.Request โดยมีโครงสร้างตาม UserPayload
 */

export type UserPayload = {
  id: number; // us_id
  username: string; // us_username
  role: string; // roles.re_name (superadmin/admin/member/tourist)
};

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
