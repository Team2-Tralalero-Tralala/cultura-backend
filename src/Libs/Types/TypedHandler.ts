import express from "express";
import { IsObject, IsOptional } from "class-validator";
import type { standardResponse } from "~/Libs/createResponse.js";
export class commonDto {
    @IsOptional()
    @IsObject()
    params?: object;

    @IsOptional()
    @IsObject()
    query?: object;

    @IsOptional()
    @IsObject()
    body?: object;

    @IsOptional()
    @IsObject()
    file?: object;
}

type InferDto<T> = T extends new (...args: any[]) => any ? InstanceType<T> : T;

export type TypedHandlerFromDto<T extends commonDto> = (
    req: express.Request<
        InferDto<T["params"]>,
        any,
        InferDto<T["body"]>,
        InferDto<T["query"]>
    >,
    res: express.Response,
    next: express.NextFunction
) => Promise<standardResponse>;
