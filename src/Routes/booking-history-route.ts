import { Router } from "express";
import { createBookingHistory, createBookingHistoryDto } from "~/Controllers/booking-history-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { BookingHistoryDto } from "~/Services/booking-history/booking-history-dto.js";

const bookingHistoryRoutes = Router();
bookingHistoryRoutes.post("/createBookingHistory", validateDto(createBookingHistoryDto), createBookingHistory);

export default bookingHistoryRoutes;