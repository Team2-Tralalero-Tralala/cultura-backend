import { Router } from "express";
import { createBookingHistory, createBookingHistoryDto } from "~/Controllers/booking-history-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";

const bookingHistoryRoutes = Router();
bookingHistoryRoutes.post("/booking", 
    validateDto(createBookingHistoryDto), 
    authMiddleware, 
    allowRoles("tourist"),
    createBookingHistory);
export default bookingHistoryRoutes;