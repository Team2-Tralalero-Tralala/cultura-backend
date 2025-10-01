import { IsUUID } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import type { Response } from "express";

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export type validResponse = {
  status: HttpStatusCode;
  error: false;
  message: string;
  data?: any;
};

export type errorResponse = {
  status: HttpStatusCode;
  error: true;
  message: string;
  data?: any;
  errorId: string;
  errors?: any;
};

export type standardResponse = validResponse | errorResponse;

export const createResponse = (
  res: Response,
  status: HttpStatusCode,
  message: string,
  data?: any
) => {
  const response: standardResponse = {
    status,
    error: false,
    message,
    ...(data ? { data } : {}),
  };
  res.status(status).json(response);
  return response;
};

export const createErrorResponse = (
  res: Response,
  status: HttpStatusCode,
  message: string,
  data?: any,
  errorId?: string,
  errors?: any
) => {
  if (!errorId) errorId = uuidv4();
  const response: standardResponse = {
    status,
    error: true,
    message,
    ...(data ? { data } : {}),
    errorId,
    ...(errors ? { errors } : {}),
  };
  res.status(status).json(response);
  return response;
};
