/*
 * คำอธิบาย : Utility functions สำหรับ validation ของ DTO (Data Transfer Object)
 * ใช้สำหรับตรวจสอบและแปลงข้อมูลที่ส่งมาจาก client ให้ตรงตาม DTO schema
 * รองรับการ validation แบบ nested objects และการแสดง error messages
 */

import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import type { commonDto } from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse } from "./createResponse.js";

/**
 * แปลง validation errors เป็นรูปแบบที่เหมาะสมสำหรับ API response
 * Input : errors (ValidationError[])
 * Output : Record<string, string[]> (object ที่มี key เป็น field path และ value เป็น array ของ error messages)
 */
export function formatValidationErrorsForApiResponse(
    errors: ValidationError[]
): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    /**
     * ฟังก์ชัน recursive สำหรับ traverse validation errors
     * Input : error (ValidationError), path (string path ของ field)
     * Output : void (แต่จะเติมค่าใน formattedErrors)
     */
    function traverse(error: ValidationError, path: string) {
        const newPath = path ? `${path}.${error.property}` : error.property;

        // เก็บ constraints (ข้อความ error) ถ้ามี
        if (error.constraints) {
            formattedErrors[newPath] = Object.values(error.constraints);
        }

        // ตรวจสอบ children ต่อไป (รองรับ nested objects)
        error.children?.forEach((child) => traverse(child, newPath));
    }

    errors.forEach((error) => traverse(error, ""));
    return formattedErrors;
}

/**
 * Middleware สำหรับ validation ของ DTO
 * Input : dto (object ที่ implements commonDto โดยมี params/query/body/file DTO classes)
 * Output : Express middleware function
 */
export function validateDto(dto: commonDto) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // วนลูปผ่าน DTO objects ที่ส่งเข้ามา (เช่น body, params, query, file)
        for (const [dtoKey, DtoClass] of Object.entries(dto)) {
            const rawData = (req as any)[dtoKey] || {};

            // แปลง plain object -> DTO instance
            const instance = plainToInstance(DtoClass as any, rawData, {
                enableImplicitConversion: true, // เปิด implicit type conversion เช่น string -> number
            });

            // ตรวจสอบ validation rules
            const errors = await validate(instance, {
                whitelist: true,      // กรอง fields ที่ไม่อยู่ใน DTO class ออก
                forbidNonWhitelisted: false, // (optional) จะ reject ถ้ามี field แปลกเข้ามา
            });

            if (errors.length > 0) {
                const formatted = formatValidationErrorsForApiResponse(errors);
                return createErrorResponse(res, 400, "Validation Error!", undefined, formatted);
            }

            // ถ้า validate ผ่าน → override data กลับเข้า req
            Object.defineProperty(req, dtoKey, {
                value: instance,
                writable: true,
                enumerable: true,
                configurable: true,
            });
        }

        next();
    };
}
