/*
 * คำอธิบาย : Controller สำหรับการจัดการ Tag
 * ประกอบด้วยการสร้าง (create), แก้ไข (edit), ลบ (delete), และดึงข้อมูล Tag ทั้งหมด(get)
 * โดยใช้ TagService ในการทำงานหลัก และส่งผลลัพธ์กลับด้วย createResponse / createErrorResponse
 */
import type { Request, Response } from "express";
import * as TagService from "../Services/tag-service.js";

/*
 * ฟังก์ชัน : createTag
 * คำอธิบาย : Handler สำหรับสร้าง Tag ใหม่
 * Input : req.body - ข้อมูล Tag จาก client
 * Output :
 *   - 201 Created พร้อมข้อมูล Tag ที่สร้างใหม่
 *   - 400 Bad Request ถ้ามี error
 */
export const createTag = async (req: Request, res: Response) => {
  try {
    const result = await TagService.createTag(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

/*
 * ฟังก์ชัน : deleteTag
 * คำอธิบาย : Handler สำหรับลบ Tag
 * Input : req.params - ข้อมูล Tag ที่ต้องการลบ 
 * Output :
 *   - 200 OK พร้อมข้อความยืนยันการลบ
 *   - 400 Bad Request ถ้ามี error
 */
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const result = await TagService.deleteTag({ id: Number(req.params.id) });
    res.status(200).json({ message: "deleted successfully", tag: result });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

/*
 * ฟังก์ชัน : editTag
 * คำอธิบาย : Handler สำหรับแก้ไข Tag
 * Input : req.body - ข้อมูล Tag ที่ต้องการแก้ไข 
 * Output :
 *   - 200 OK พร้อมข้อมูล Tag ที่แก้ไขแล้ว
 *   - 400 Bad Request ถ้ามี error
 */
export const editTag = async (req: Request, res: Response) => {
  try {
    const data  = req.body;
    const id = Number(req.params.id);
    const result = await TagService.editTag( id, data );
    res.status(200).json({ message: "edited successfully", tag: result });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

/*
 * ฟังก์ชัน : getAllTags
 * คำอธิบาย : Handler สำหรับดึงข้อมูล Tag ทั้งหมด
 * Input : req.body - ข้อมูลผู้ใช้จาก client
 * Output :
 *   - 200 OK พร้อมข้อมูล Tag ทั้งหมด
 *   - 400 Bad Request ถ้ามี error
 */
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const result = await TagService.getAllTags();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

