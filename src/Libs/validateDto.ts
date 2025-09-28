/*
 * คำอธิบาย : Utility functions สำหรับ validation ของ DTO (Data Transfer Object)
 * ใช้สำหรับตรวจสอบและแปลงข้อมูลที่ส่งมาจาก client ให้ตรงตาม DTO schema
 * รองรับการ validation แบบ nested objects และการแสดง error messages
 */

import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import type {
    commonDto
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse } from "./createResponse.js";

/**
 * แปลง validation errors เป็นรูปแบบที่เหมาะสมสำหรับ API response
 * Input : errors (array ของ ValidationError objects)
 * Output : Record<string, string[]> (object ที่มี key เป็น field path และ value เป็น array ของ error messages)
 */
export function formatValidationErrorsForApiResponse(
    errors: ValidationError[]
): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    /**
     * ฟังก์ชัน recursive สำหรับ traverse validation errors
     * Input : error (ValidationError object), path (string path ของ field)
     * Output : void (แต่จะ populate formattedErrors object)
     */
    function traverse(error: ValidationError, path: string) {
        const newPath = path ? `${path}.${error.property}` : error.property;
        if (error.constraints) {
            formattedErrors[newPath] = Object.values(error.constraints);
        }
        error.children?.forEach((child) => traverse(child, newPath));
    }

    errors.forEach((error) => traverse(error, ""));
    return formattedErrors;
}

/**
 * Middleware function สำหรับ validation ของ DTO
 * Input : dto (commonDto object ที่มี DTO classes)
 * Output : Express middleware function
 */
export function validateDto(dto: commonDto) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // วนลูปผ่าน DTO objects ที่ส่งเข้ามา
        for (const [DtoKey, Dto] of Object.entries(dto)) {
            const dataToValidate = (req as any)[DtoKey] || {};
            
            // แปลง plain object เป็น DTO instance
            const instance = plainToInstance(Dto, dataToValidate, {
                enableImplicitConversion: true,    // เปิดใช้งานการแปลง type อัตโนมัติ
            });
            
            // ตรวจสอบ validation
            const errors = await validate(instance);
            if (errors.length > 0) {
                const formatted = formatValidationErrorsForApiResponse(errors);
                return createErrorResponse(res, 400, "Validation Error!", undefined, formatted);
            }
            
            // ใส่ transformed instance กลับไปใน request object
            Object.defineProperty(req, DtoKey, {
                value: instance,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }

        next();
    };
}
