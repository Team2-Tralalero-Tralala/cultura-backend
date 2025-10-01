import { IsNumberString } from "class-validator";
import { createResponse, createErrorResponse } from "../Libs/createResponse.js";
import * as AccountService from "../Services/account-service.js";
import { CreateAccountDto, EditAccountDto } from "../Services/account-dto.js";
import type { commonDto, TypedHandlerFromDto } from "../Libs/Types/TypedHandler.js";
import type { Request, Response } from "express";

export const createAccountDto = {
  body: CreateAccountDto,
} satisfies commonDto;

export class AccountIdParamDto {
  @IsNumberString()
  id?: number;
}

export const editAccountDto = {
  body: EditAccountDto,
  params: AccountIdParamDto,
} satisfies commonDto;

export const createAccount: TypedHandlerFromDto<typeof createAccountDto> = async (req, res) => {
  try {
    const result = await AccountService.createAccount(req.body);
    return createResponse(res, 201, "Account created successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

export const editAccount: TypedHandlerFromDto<typeof editAccountDto> = async (req, res) => {
  try {
    const result = await AccountService.editAccount(Number(req.params.id), req.body);
    return createResponse(res, 200, "Account updated successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query as { page?: string; limit?: string };
    const data = await AccountService.getAllUser(Number(page), Number(limit));
    return createResponse(res, 200, "Get users successfully", data);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};