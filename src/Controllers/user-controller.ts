import { IsEnum } from "class-validator";
import { UserStatus } from "@prisma/client";
import * as UserService from "../Services/user/user-service.js";
import {
  AccountQueryDto,
  AccountStatusQueryDto,
  IdParamDto,
} from "~/Services/user/user-dto.js";

import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import type { commonDto, TypedHandlerFromDto } from "~/Libs/Types/TypedHandler.js";

/* ==================== DTO ==================== */
class StatusParamDto {
  @IsEnum(UserStatus)
  status?: UserStatus;
}

/* ==================== ดึงผู้ใช้ทั้งหมด ==================== */
export const getAccountsDto = {
  query: AccountQueryDto,
} satisfies commonDto;

export const getAccountAll: TypedHandlerFromDto<typeof getAccountsDto> = async (req, res) => {
  try {
    if (!req.user) return createErrorResponse(res, 401, "User not authenticated");

    const { page = 1, limit = 10, searchName, filterRole } = req.query;

    const result = await UserService.getAccountAll(
      req.user,
      Number(page),
      Number(limit),
      searchName,
      filterRole
    );

    return createResponse(res, 200, "Accounts fetched successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/* ==================== ดึงผู้ใช้ตามสถานะ ==================== */
export const getUserByStatusDto = {
  params: StatusParamDto,
  query: AccountStatusQueryDto,
} satisfies commonDto;

export const getUserByStatus: TypedHandlerFromDto<typeof getUserByStatusDto> = async (req, res) => {
  try {
    if (!req.user) return createErrorResponse(res, 401, "User not authenticated");

    const { page = 1, limit = 10, searchName } = req.query;
    const status = req.params.status;

    if (!status || !Object.values(UserStatus).includes(status as UserStatus)) {
      return createErrorResponse(res, 400, "Invalid status. Must be ACTIVE or BLOCKED");
    }

    const result = await UserService.getUserByStatus(
      req.user,
      status as UserStatus,
      Number(page),
      Number(limit),
      searchName
    );

    return createResponse(res, 200, "Users fetched successfully", result);
  } catch (error) {
    return createErrorResponse(res, 500, (error as Error).message);
  }
};

/* ==================== CRUD พื้นฐาน ==================== */
export const getUserByIdDto = { params: IdParamDto } satisfies commonDto;
export const deleteAccountByIdDto = { params: IdParamDto } satisfies commonDto;
export const blockAccountByIdDto = { params: IdParamDto } satisfies commonDto;
export const unblockAccountByIdDto = { params: IdParamDto } satisfies commonDto;

export const getUserById: TypedHandlerFromDto<typeof getUserByIdDto> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const result = await UserService.getUserById(userId);
    return createResponse(res, 200, "User fetched successfully", result);
  } catch (error) {
    return createErrorResponse(res, 404, (error as Error).message);
  }
};

export const deleteAccountById: TypedHandlerFromDto<typeof deleteAccountByIdDto> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const result = await UserService.deleteAccount(userId);
    return createResponse(res, 200, "Deleted user successfully", result);
  } catch (error) {
    return createErrorResponse(res, 404, (error as Error).message);
  }
};

export const blockAccountById: TypedHandlerFromDto<typeof blockAccountByIdDto> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const result = await UserService.blockAccount(userId);
    return createResponse(res, 200, "User blocked successfully", result);
  } catch (error) {
    return createErrorResponse(res, 404, (error as Error).message);
  }
};

export const unblockAccountById: TypedHandlerFromDto<typeof unblockAccountByIdDto> = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const result = await UserService.unblockAccount(userId);
    return createResponse(res, 200, "User unblocked successfully", result);
  } catch (error) {
    return createErrorResponse(res, 404, (error as Error).message);
  }
};
