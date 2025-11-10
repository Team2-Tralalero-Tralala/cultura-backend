// import { Router } from "express";
// import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
// import {
//   getByRole,
//   getDetailBooking,
// } from "../Controllers/booking-history-controller.js";

// const router = Router();

// router.get("/histories", authMiddleware, allowRoles("admin", "member"), getByRole);
// router.get("/:id", getDetailBooking);

// export default router;

import { Router } from "express";
import { authMiddleware, allowRoles } from "~/Middlewares/auth-middleware.js";
import * as BookingHistoryController from "~/Controllers/booking-history-controller.js";
import { validateDto } from "~/Libs/validateDto.js";

const bookingRoutes = Router();

/*
 * path : GET /admin/bookings/all
 * คำอธิบาย : ใช้สำหรับดึงรายการการจองทั้งหมดของแพ็กเกจในชุมชนที่แอดมินดูแล
 * สิทธิ์ที่เข้าถึงได้ : Admin
 */
bookingRoutes.get(
  "/admin/bookings/all",
  validateDto(BookingHistoryController.getBookingsByAdminDto),
  authMiddleware,
  allowRoles("admin"),
  BookingHistoryController.getBookingsByAdmin
);

/*
 * path : GET /histories
 * คำอธิบาย : ดึงรายการการจองตามสิทธิ์ของผู้ใช้ (admin/member)
 * สิทธิ์ที่เข้าถึงได้ : Admin, Member
 */
bookingRoutes.get(
  "/histories",
  authMiddleware,
  allowRoles("admin", "member"),
  BookingHistoryController.getByRole
);

/*
 * path : GET /:id
 * คำอธิบาย : ดึงรายละเอียดการจองตาม Booking ID
 * สิทธิ์ที่เข้าถึงได้ : ทุก role ที่มีสิทธิ์ดูรายละเอียด
 */
bookingRoutes.get(
  "/:id",
  authMiddleware,
  allowRoles("admin", "member", "tourist"),
  BookingHistoryController.getDetailBooking
);

export default bookingRoutes;




