import { IsNumberString } from "class-validator";
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import { PaginationDto } from "~/Services/pagination-dto.js";
import { StoreDto } from "~/Services/store/store-dto.js";
import * as StoreService from "~/Services/store/store-service.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

/* ----------------------------- DTO ----------------------------- */

export class CommunityIdParamDto {
  @IsNumberString()
  communityId?: string;
}

export class IdParamDto {
  @IsNumberString()
  storeId?: string;
}

/* ----------------------------- CREATE STORE ----------------------------- */

export const createStoreDto = {
  body: StoreDto,
  params: CommunityIdParamDto,
} satisfies commonDto;

export const createStore: TypedHandlerFromDto<typeof createStoreDto> = async (
  req,
  res
) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    const communityId = Number(req.params.communityId);

    const files = req.files as {
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    };

    const parsed = JSON.parse(req.body.data);
    const storeImage = [
      ...(files.cover?.map((f) => ({ image: f.path, type: "COVER" })) || []),
      ...(files.gallery?.map((f) => ({ image: f.path, type: "GALLERY" })) || []),
    ];

    const result = await StoreService.createStore(
      { ...parsed, storeImage },
      req.user,
      communityId
    );

    return createResponse(res, 201, "Store created successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/* ----------------------------- GET ALL STORES ----------------------------- */

export const getAllStoreDto = {
  query: PaginationDto,
  params: CommunityIdParamDto,
} satisfies commonDto;

export const getAllStore: TypedHandlerFromDto<typeof getAllStoreDto> = async (
  req,
  res
) => {
  try {
    const userId = Number(req.user!.id);
    const communityId = Number(req.params.communityId);
    const result = await StoreService.getAllStore(userId, communityId);
    return createResponse(res, 200, "Get stores successfully", result);
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};

/* ----------------------------- EDIT STORE ----------------------------- */

export const editStoreDto = {
  body: StoreDto,
  params: IdParamDto,
} satisfies commonDto;

export const editStore: TypedHandlerFromDto<typeof editStoreDto> = async (
  req,
  res
) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    const files = req.files as {
      cover?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    };

    const parsed = JSON.parse(req.body.data);
    const storeImage = [
      ...(files.cover?.map((f) => ({ image: f.path, type: "COVER" })) || []),
      ...(files.gallery?.map((f) => ({ image: f.path, type: "GALLERY" })) || []),
    ];

    const storeId = Number(req.params.storeId);
    const result = await StoreService.editStore(
      storeId,
      { ...parsed, storeImage },
      req.user
    );

    return createResponse(res, 200, "Store updated successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/* ----------------------------- GET STORE BY ID ----------------------------- */

export const getStoreByIdDto = {
  params: IdParamDto,
} satisfies commonDto;

export const getStoreById: TypedHandlerFromDto<typeof getStoreByIdDto> = async (
  req,
  res
) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    const storeId = Number(req.params.storeId);
    const result = await StoreService.getStoreById(storeId);
    return createResponse(res, 200, "Get store successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};

/* ----------------------------- DELETE STORE ----------------------------- */

export const deleteStoreDto = {
  params: IdParamDto,
} satisfies commonDto;

export const deleteStore: TypedHandlerFromDto<typeof deleteStoreDto> = async (
  req,
  res
) => {
  try {
    if (!req.user)
      return createErrorResponse(res, 401, "User not authenticated");

    const storeId = Number(req.params.storeId);
    const result = await StoreService.deleteStore(storeId, req.user);
    return createResponse(res, 200, "Store deleted successfully", result);
  } catch (error: any) {
    return createErrorResponse(res, 400, error.message);
  }
};
