import { Router } from "express";
import * as bookingController from "../Controllers/booking-history-controller.js";

/*
 * ฟังก์ชัน : detailBookingRouter
 * คำอธิบาย : Routing สำหรับจัดการ endpoint ที่เกี่ยวข้องกับการดึงรายละเอียดการจอง (Booking Detail)
 * Endpoint :
 *   GET /:id 
 */

const detailBookingRouter = Router();
detailBookingRouter.get("/:id", bookingController.getDetailBooking);

export default detailBookingRouter;
