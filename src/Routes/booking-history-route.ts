import { Router } from "express";
import { createBookingHistory, createBookingHistoryDto } from "~/Controllers/booking-history-controller.js";
import { validateDto } from "~/Libs/validateDto.js";

const bookingHistoryRoutes = Router();
bookingHistoryRoutes.post("/booking-history", validateDto(createBookingHistoryDto), createBookingHistory);
export default bookingHistoryRoutes;