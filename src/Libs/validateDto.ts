import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import type {
    commonDto
} from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse } from "./createResponse.js";

export function formatValidationErrorsForApiResponse(
    errors: ValidationError[]
): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

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


export function validateDto(dto: commonDto) {
    return async (req: Request, res: Response, next: NextFunction) => {
        for (const [DtoKey, Dto] of Object.entries(dto)) {
            const dataToValidate = (req as any)[DtoKey] || {};
            const instance = plainToInstance(Dto, dataToValidate, {
                enableImplicitConversion: true,
                excludeExtraneousValues: true,
            });
            const errors = await validate(instance);
            if (errors.length > 0) {
                const formatted = formatValidationErrorsForApiResponse(errors);
                return createErrorResponse(res, 400, "Validation Error!", undefined, formatted);
            }
            
            // Apply the transformed instance back to the request
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
