import { createResponse } from "~/Libs/createResponse.js";
import { createErrorResponse } from "~/Libs/createResponse.js";
import * as storeService from "../Services/store-service.js";
import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

export const storeDto = {} satisfies commonDto;

export const getStoreById: TypedHandlerFromDto<typeof storeDto> = async (
  req,
  res
) => {
  try {
    const myId = req.user?.id;
    const result = await storeService.getStoreById(Number(myId));
    return createResponse(
      res,
      200,
      "Fetched draft package successfully",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};