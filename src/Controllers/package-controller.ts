import { createResponse } from "~/Libs/createResponse.js";
import { createErrorResponse } from "~/Libs/createResponse.js";
import * as CommunityService from "../Services/package-service.js";
import type {
  commonDto,
  TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";

export const packageDto = {} satisfies commonDto;

export const getDraftPackage: TypedHandlerFromDto<typeof packageDto> = async (
  req,
  res
) => {
  try {
    const myId = req.user?.id;
    const result = await CommunityService.getDraftPackage(Number(myId));
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
