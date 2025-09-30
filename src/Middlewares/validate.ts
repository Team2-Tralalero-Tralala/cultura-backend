// src/Middlewares/validate.ts
import 'reflect-metadata'; 
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { Request, Response, NextFunction } from "express";

export function validateBody(Dto: new () => any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(Dto, req.body, {
      enableImplicitConversion: true,
    });

    const errors = await validate(instance, {
      whitelist: true,            // ตัด field แปลก ๆ ออก
      forbidNonWhitelisted: true, // ถ้ามี field แปลก โยน error
    });

    if (errors.length) {
      return res.status(400).json({
        ok: false,
        error: "validation_error",
        details: errors.map((e) => ({
          field: e.property,
          errors: Object.values(e.constraints ?? {}),
        })),
      });
    }

    // body ที่ผ่านการ sanitize แล้ว
    req.body = instance;
    next();
  };
}
