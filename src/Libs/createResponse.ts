/*
 * คำอธิบาย : Utility functions สำหรับสร้าง standardized API responses
 * ใช้สำหรับสร้าง response format ที่สอดคล้องกันทั้งระบบ
 * รองรับทั้ง success response และ error response
 */

import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * HTTP Status Code enumeration
 * กำหนด HTTP status codes ที่ใช้ในระบบ
 */
export enum HttpStatusCode {
    OK = 200,                    // สำเร็จ
    CREATED = 201,               // สร้างข้อมูลสำเร็จ
    ACCEPTED = 202,              // ยอมรับคำขอ
    NO_CONTENT = 204,            // สำเร็จแต่ไม่มีข้อมูลส่งกลับ
    BAD_REQUEST = 400,           // คำขอไม่ถูกต้อง
    UNAUTHORIZED = 401,          // ไม่มีสิทธิ์เข้าถึง
    FORBIDDEN = 403,             // ถูกห้าม
    NOT_FOUND = 404,             // ไม่พบข้อมูล
    CONFLICT = 409,              // ข้อมูลขัดแย้ง
    INTERNAL_SERVER_ERROR = 500, // ข้อผิดพลาดภายในเซิร์ฟเวอร์
}

/**
 * Type สำหรับ success response
 * ใช้เมื่อ API call สำเร็จ
 */
export type validResponse = {
    status: HttpStatusCode;      // HTTP status code
    error: false;                // บ่งบอกว่าไม่ใช่ error
    message: string;             // ข้อความอธิบาย
    data?: any;                  // ข้อมูลที่ส่งกลับ (optional)
};

/**
 * Type สำหรับ error response
 * ใช้เมื่อ API call มีข้อผิดพลาด
 */
export type errorResponse = {
    status: HttpStatusCode;      // HTTP status code
    error: true;                 // บ่งบอกว่าเป็น error
    message: string;             // ข้อความอธิบาย error
    errorId: string;             // ID สำหรับติดตาม error
    errors?: any;                // รายละเอียด error เพิ่มเติม (optional)
};

/**
 * Union type สำหรับ standard response
 * รวม validResponse และ errorResponse
 */
export type standardResponse = validResponse | errorResponse;

/**
 * สร้าง success response
 * Input : res (Express Response object), status (HTTP status code), message (ข้อความ), data (ข้อมูล)
 * Output : standardResponse object
 */
export const createResponse = (res: Response, status: HttpStatusCode, message: string, data?: any) => {
    const response: standardResponse = {
        status,
        error: false,
        message,
        ...(data ? { data } : {}),  // เพิ่ม data ถ้ามี
    };
    res.status(status).json(response);
    return response;
};

/**
 * สร้าง error response
 * Input : res (Express Response object), status (HTTP status code), message (ข้อความ), errorId (ID สำหรับติดตาม), errors (รายละเอียด error)
 * Output : standardResponse object
 */
export const createErrorResponse = (res: Response, status: HttpStatusCode, message: string, errorId?: string, errors?: any) => {
    if (!errorId) errorId = uuidv4();  // สร้าง UUID ถ้าไม่มี errorId
    const response: standardResponse = {
        status,
        error: true,
        message,
        errorId,
        ...(errors ? { errors } : {}),  // เพิ่ม errors ถ้ามี
    };
    res.status(status).json(response);
    return response;
};
