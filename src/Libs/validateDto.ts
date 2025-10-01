// src/Libs/validateDto.ts
import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import type { Request, Response, NextFunction } from "express";
import type { commonDto } from "./Types/TypedHandler.js";
import { createErrorResponse } from "./createResponse.js";

/** แปลง ValidationError[] เป็น { "path.to.field": ["msg1","msg2"] } */
export function formatValidationErrorsForApiResponse(
  errors: ValidationError[]
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  const traverse = (err: ValidationError, path: string) => {
    const key = path ? `${path}.${err.property}` : err.property;

    if (err.constraints) {
      formatted[key] = Object.values(err.constraints);
    }
    if (err.children?.length) {
      err.children.forEach((child) => traverse(child, key));
    }
  };

  errors.forEach((e) => traverse(e, ""));
  return formatted;
}

/** middleware สำหรับ validate body/query/params ตาม DTO ที่ระบุ */
export function validateDto<D extends commonDto>(dto: D) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // กำหนดแหล่งข้อมูลที่จะตรวจ
      const containers: Array<["body" | "query" | "params", any]> = [
        ["body", dto.body],
        ["query", dto.query],
        ["params", dto.params],
      ];

      for (const [sourceName, DtoClass] of containers) {
        if (!DtoClass) continue;

        const raw = (req as any)[sourceName];

        // sanitize + transform
        const instance = plainToInstance(DtoClass as any, raw, {
          enableImplicitConversion: true,
        });

        const errors = await validate(instance, {
          whitelist: true,
          forbidNonWhitelisted: true,
        });

        // ถ้า validate ไม่ผ่าน ส่งรายละเอียดออกไป (ไม่ใช้ createErrorResponse เพื่อแนบ details ได้)
        if (errors.length) {
          const details = formatValidationErrorsForApiResponse(errors);
          return res.status(400).json({
            ok: false,
            error: "validation_error",
            source: sourceName, // "body" | "query" | "params"
            details,            // Record<string, string[]>
          });
        }

        // เขียนค่าที่ sanitize แล้วกลับเข้า req
        (req as any)[sourceName] = instance;
      }

      return next();
    } catch (err) {
      // กรณี exception อื่น ๆ
      return createErrorResponse(res, 400, (err as Error).message);
    }
  };
}
