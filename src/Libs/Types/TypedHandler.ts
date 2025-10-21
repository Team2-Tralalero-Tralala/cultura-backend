/*
 * คำอธิบาย : Types และ DTO สำหรับจัดการ Type Safety ของ Express Handler
 * ไฟล์นี้ประกอบด้วย commonDto class และ TypedHandlerFromDto type
 * ที่ช่วยให้ Express.js handlers มี type safety ในการจัดการ request data
 * รวมถึง validation ของ params, query, body และ file uploads
 */

import { IsObject, IsOptional } from "class-validator";
import express from "express";
import type { standardResponse } from "~/Libs/createResponse.js";

/*
 * คำอธิบาย : Base DTO class สำหรับ validation ของ request data ทุกประเภท
 * ใช้ class-validator decorators เพื่อตรวจสอบข้อมูลที่เข้ามา
 * รองรับการ validate params, query string, request body และ file uploads
 * Input : ไม่มี (เป็น base class)
 * Output : DTO class structure พร้อม validation decorators
 */
export class commonDto {
    /** Route parameters เช่น /users/:id */
    @IsOptional()
    @IsObject()
    params?: object;

    /** Query string parameters เช่น ?page=1&limit=10 */
    @IsOptional()
    @IsObject()
    query?: object;

    /** Request body data (JSON payload) */
    @IsOptional()
    @IsObject()
    body?: object;

    /** File upload data (multipart/form-data) */
    @IsOptional()
    @IsObject()
    file?: object;
}

/*
 * คำอธิบาย : Utility type สำหรับ infer instance type จาก class constructor
 * ช่วยให้สามารถดึง type ที่ถูกต้องจาก DTO class ได้
 * Input : Generic type T (class constructor หรือ type)
 * Output : Instance type ของ class หรือ type เดิม
 */
type InferDto<T> = T extends new (...args: any[]) => any ? InstanceType<T> : T;

/*
 * คำอธิบาร : Utility type สำหรับแปลง optional properties ให้รองรับ undefined
 * เพื่อให้สอดคล้องกับ exactOptionalPropertyTypes: true
 * Input : Generic type T
 * Output : Type ที่ optional properties สามารถเป็น undefined ได้
 */
type AllowUndefined<T> = T extends object
  ? {
      [K in keyof T]: undefined extends T[K] ? T[K] | undefined : T[K];
    }
  : T;

/*
 * คำอธิบาย : Utility type สำหรับแปลงทุก properties ให้รองรับ undefined
 * ใช้สำหรับ query parameters ที่อาจไม่มีค่าก่อนผ่าน validation
 * Input : Generic type T
 * Output : Type ที่ทุก properties เป็น optional และสามารถเป็น undefined ได้
 */
type AllowAllUndefined<T> = T extends object
  ? {
      [K in keyof T]?: T[K] | undefined;
    }
  : T;

/*
 * คำอธิบาย : Type สำหรับสร้าง Typed Express Handler ที่มี type safety
 * รับ DTO class ที่ extends commonDto และสร้าง handler function
 * ที่มี type safety สำหรับ req.params, req.body, req.query
 * และต้อง return Promise<standardResponse>
 * Input : DTO class ที่ extends commonDto
 * Output : Typed Express handler function พร้อม type safety
 */
export type TypedHandlerFromDto<T extends commonDto> = (
    req: express.Request<
        T["params"] extends undefined ? unknown : AllowUndefined<InferDto<T["params"]>>,
        any,
        T["body"] extends undefined ? unknown : AllowUndefined<InferDto<T["body"]>>,
        T["query"] extends undefined ? unknown : AllowAllUndefined<InferDto<T["query"]>>
    >,
    res: express.Response,
    next: express.NextFunction
) => Promise<standardResponse>;