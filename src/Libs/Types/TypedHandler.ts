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
 * Base DTO สำหรับ validate request data ทุกประเภท
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
 * Utility type สำหรับ infer instance type จาก class constructor หรือ type
 */
type InferDto<T> = T extends new (...args: any[]) => any ? InstanceType<T> : T;

/*
 * Type สำหรับสร้าง Typed Express Handler ที่มี type safety
 * Input: DTO object ที่ extends commonDto
 */
export type TypedHandlerFromDto<T extends commonDto> = (
    req: express.Request<
        InferDto<T["params"]>,
        any,
        InferDto<T["body"]>,
        InferDto<T["query"]>
    > & { file?: InferDto<T["file"]> },
    res: express.Response,
    next: express.NextFunction
) => Promise<standardResponse>;






// import type { Request, Response } from "express";

// type ClassType<T = any> = new (...args: any[]) => T;

// export type commonDto = {
//   body?: ClassType;
//   query?: ClassType;
//   params?: ClassType;
// };

// type ReqFromDto<D extends commonDto> = Request<
//   D["params"] extends ClassType ? InstanceType<D["params"]> : Record<string, any>,
//   any,
//   D["body"] extends ClassType ? InstanceType<D["body"]> : any,
//   D["query"] extends ClassType ? InstanceType<D["query"]> : any
// >;

// export type TypedHandlerFromDto<D extends commonDto> = (
//   req: ReqFromDto<D>,
//   res: Response
// ) => Promise<any>;
