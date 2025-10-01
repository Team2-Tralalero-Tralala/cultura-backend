import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import * as BookingHistoryService from "../Services/booking-history/booking-history-service.js";
import type { commonDto, TypedHandlerFromDto } from "~/Libs/Types/TypedHandler.js";
import { BookingHistoryDto } from "~/Services/booking-history/booking-history-dto.js";

/*
 * คำอธิบาย : Schema สำหรับ validate ข้อมูลตอนสร้าง Booking History
 * Input  : body (BookingHistoryDto)
 * Output : commonDto object
 */
export const createBookingHistoryDto = {
    body: BookingHistoryDto,
} satisfies commonDto;

/*
 * คำอธิบาย : Controller สำหรับสร้าง Booking History ใหม่
 * Input  : Request body (BookingHistoryDto)
 * Output : JSON response { status, message, data }
 */
export const createBookingHistory: TypedHandlerFromDto<typeof createBookingHistoryDto> = async (req, res) => {
    try {
        const result = await BookingHistoryService.createBooking(req.body);
        return createResponse(res, 200, "Create Booking History Success", result)
    } catch (error: any) {
        return createErrorResponse(res, 404, (error as Error).message)
    }
};