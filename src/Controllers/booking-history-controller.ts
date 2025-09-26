import type { Request, Response } from "express";
import * as BookingHistoryService from "../Services/booking-history-service.js";
import prisma from "~/Services/database-service.js";
import type { commonDto } from "~/Libs/Types/TypedHandler.js";
import { BookingHistoryDto } from "~/Services/booking-history/booking-history-dto.js";


export const createBookingHistoryDto = {
    body: BookingHistoryDto,
} satisfies commonDto;

export const createBookingHistory = async (req: Request, res: Response) => {
    try {
        const result = await BookingHistoryService.createBookingHistory(req.body);
        return res.json({ status:200, data: result });
    } catch (error: any) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};