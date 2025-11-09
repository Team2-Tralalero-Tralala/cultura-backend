// src/Services/package/package-request-dto.ts
import { Expose } from "class-transformer";
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationDto } from "../pagination-dto.js";

/**
 * Query DTO สำหรับดึงรายการคำขอแพ็กเกจ
 * - page, limit มาจาก PaginationDto
 * - search: ข้อความค้นหา
 * - statusApprove: PENDING | APPROVE | PENDING_SUPER | all
 */
export class PackageRequestQueryDto extends PaginationDto {
    @Expose()
    @IsOptional()
    @IsString({ message: "คำค้นหาต้องเป็นข้อความ" })
    search?: string;

    @Expose()
    @IsOptional()
    @IsString({ message: "สถานะต้องเป็นข้อความ" })
    @IsIn(["PENDING", "APPROVE", "PENDING_SUPER", "all"], {
        message:
            "statusApprove ต้องเป็นหนึ่งในค่า: PENDING, APPROVE, PENDING_SUPER, all",
    })
    statusApprove?: string;
}

/* 
 * DTO : RejectReasonDto
 * คำอธิบาย : ข้อมูล "เหตุผลการปฏิเสธ" ที่ส่งมาจากฝั่ง Frontend เพื่อบันทึกลงระบบ
 * กฎตรวจสอบ :
 *  - reason ต้องเป็นข้อความ (string)
 *  - reason ห้ามว่าง (ไม่อนุญาตค่าว่างหรือช่องว่างล้วน)
 *  - reason ความยาวไม่เกิน 100 อักขระ
 */
export class RejectReasonDto {
    @Expose()
    @IsString({ message: "เหตุผลต้องเป็นข้อความ" })
    @IsNotEmpty({ message: "เหตุผลห้ามว่าง" })
    @MaxLength(100, { message: "name ยาวเกิน 100 ตัวอักษร" })
    reason!: string;
}
