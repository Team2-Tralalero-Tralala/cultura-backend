import { TypedHandlerFromDto } from "../Types/TypedHandler.ts";
import { commonDto } from "../Types/dto/common-dto.js";
import { getDraftPackage } from "../Services/package-service.js";
import { createResponse } from "~/Libs/createResponse.js";
import { createErrorResponse } from "~/Libs/createResponse.js";
import * as CommunityService from "../Services/package-service.js";   

export const packageDto = {} satisfies commonDto;

export const getDraftPackage: TypedHandlerFromDto = async (
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