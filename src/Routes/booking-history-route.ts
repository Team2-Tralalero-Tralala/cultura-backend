import { Router } from "express";
import * as bookingController from "../Controllers/booking-history-controller.js";
import { createBookingHistory, createBookingHistoryDto } from "../Controllers/booking-history-controller.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import { validateDto } from "~/Libs/validateDto.js";

/*
 * คำอธิบาย : Routing สำหรับการดึงข้อมูลรายละเอียดการจอง (BookingDetail)
 * Endpoint : GET/:id
 */

const detailBookingRouter = Router();
detailBookingRouter.get("/:id", bookingController.getDetailBooking);

detailBookingRouter.post("/tourist/booking", 
    validateDto(createBookingHistoryDto), 
    authMiddleware, 
    allowRoles("tourist"),
    createBookingHistory);

export default detailBookingRouter;

