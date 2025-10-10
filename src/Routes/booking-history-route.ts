import { Router } from "express";
import { authMiddleware } from "~/Middlewares/auth-middleware.js";
import { getByRole } from "../Controllers/booking-history-controller.js";
import * as bookingController from "../Controllers/booking-history-controller.js";
import { createBookingHistory, createBookingHistoryDto } from "../Controllers/booking-history-controller.js";
import { allowRoles, authMiddleware } from "~/Middlewares/auth-middleware.js";
import { validateDto } from "~/Libs/validateDto.js";

const router = Router();

router.get("/role", authMiddleware, getByRole);

export default router;


detailBookingRouter.post("/booking", 
    validateDto(createBookingHistoryDto), 
    authMiddleware, 
    allowRoles("tourist"),
    createBookingHistory);

export default detailBookingRouter;

