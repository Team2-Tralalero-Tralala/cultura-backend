// 📄 user-controller.ts
import type { Request, Response } from "express";
import { getAllUsersService, getUserByIdService } from "../Services/user-service.js";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsersService();
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผู้ใช้สำเร็จ",
      data: users,
    });
  } catch (error : any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await getUserByIdService(id);
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผู้ใช้สำเร็จ",
      data: user,
    });
  } catch (error : any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
