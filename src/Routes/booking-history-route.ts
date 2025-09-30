import { Router } from "express";
import * as bookingController from "../Controllers/booking-history-controller.js";

/*
 * คำอธิบาย : Routing สำหรับการดึงข้อมูลรายละเอียดการจอง (BookingDetail)
 * Endpoint : GET/:id
 */

const detailBookingRouter = Router();
detailBookingRouter.get("/:id", bookingController.getDetailBooking);

export default detailBookingRouter;
Router;
