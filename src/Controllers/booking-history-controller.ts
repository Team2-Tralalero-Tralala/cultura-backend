import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import * as BookingHistoryService from "../Services/booking-history/booking-history-service.js";
import type { commonDto, TypedHandlerFromDto } from "~/Libs/Types/TypedHandler.js";
import { BookingHistoryDto } from "~/Services/booking-history/booking-history-dto.js";

export const createBookingHistoryDto = {
    body: BookingHistoryDto,
} satisfies commonDto;

export const createBookingHistory: TypedHandlerFromDto<typeof createBookingHistoryDto> = async (req, res) => {
    try {
        const result = await BookingHistoryService.createBookingHistory(req.body);
        return createResponse(res, 200, "Success Created", {result})
    } catch (error: any) {
        return createErrorResponse(res, 404, (error as Error).message)
    }
};