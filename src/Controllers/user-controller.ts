
import type { Request, Response } from "express";
import * as UserService from "../Services/user-service.js";
import { UserStatus } from "@prisma/client";

import { IsInt, IsNumber, IsNumberString } from "class-validator";
import { PaginationDto } from "~/Libs/Types/pagination-dto.js";

import type {
    commonDto,
    TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

export class IdParamDto {
  @IsNumberString()
  userId?: string;
}

export const getUserByIdDto = {
  params: IdParamDto,
} satisfies commonDto;


export const getUserById: TypedHandlerFromDto<typeof getUserByIdDto> = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const getUser = await UserService.getUserById(userId);
        return createResponse(res, 201, "User fetched successfully", getUser);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};


export const getUserByStatusDto = {
  params: class StatusParamDto {
    status!: string;
  },
  query: PaginationDto,
} satisfies commonDto;


export const getUserByStatus: TypedHandlerFromDto<typeof getUserByStatusDto> = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const status = req.params.status?.toUpperCase();

        if (!status || !Object.values(UserStatus).includes(status as UserStatus)) {
            return createErrorResponse(res, 400, "Invalid status. Must be ACTIVE or BLOCKED");
        }

        const users = await UserService.getUserByStatus(
            status as UserStatus,
            Number(page),
            Number(limit)
        );

        return createResponse(res, 200, "Users fetched successfully", users);
    } catch (error) {
        return createErrorResponse(res, 500, (error as Error).message);
    }
};


export const deleteAccountByIdDto = {
  params: IdParamDto,
} satisfies commonDto;


export const deleteAccountById: TypedHandlerFromDto<typeof deleteAccountByIdDto> = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const deletedUser = await UserService.deleteAccount(userId);
        return createResponse(res, 201, "Deleted user successfully", deletedUser);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

export const blockAccountByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

export const blockAccountById: TypedHandlerFromDto<typeof blockAccountByIdDto> = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const blockedUser = await UserService.blockAccount(userId);
        return createResponse(res, 201, "User blocked successfully", blockedUser);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};

export const unblockAccountByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

export const unblockAccountById: TypedHandlerFromDto<typeof unblockAccountByIdDto> = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const unblockUser = await UserService.unblockAccount(userId);
        return createResponse(res, 201, "User unblock successfully", unblockUser);
    } catch (error) {
        return createErrorResponse(res, 404, (error as Error).message);
    }
};