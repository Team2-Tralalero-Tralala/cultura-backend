import type { Request, Response } from "express";
import * as AuthService from "~/Services/auth-service.js";
import type { commonDto, TypedHandlerFromDto } from "~/Libs/Types/TypedHandler.js";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";

export const signupDto = {
    body: AuthService.signupDto,
} satisfies commonDto;

export const signup: TypedHandlerFromDto<typeof signupDto> = async (req, res) => {
  try {
    const result = await AuthService.signup(req.body);
    return createResponse(res, 201, "User created successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

export const loginDto = {
    body: AuthService.loginDto,
} satisfies commonDto;

export const login: TypedHandlerFromDto<typeof loginDto> = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    return createResponse(res, 201, "Login successful", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
