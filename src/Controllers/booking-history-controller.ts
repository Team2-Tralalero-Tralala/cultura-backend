import type { Request, Response } from "express";
import * as BookingHistoryService from "../Services/booking-history-service.js";
import { createResponse, createErrorResponse } from "~/Libs/createResponse.js";

/*
// GET /booking-histories/community/:communityId
export const getByCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const data = await BookingHistoryService.getHistoriesByCommunity(Number(communityId));
    res.status(200).json({ status: 200, data });
  } catch (e: any) {
    res.status(500).json({ status: 500, message: e.message });
  }
};

// GET /booking-histories/member/:memberId
export const getByMember = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const data = await BookingHistoryService.getHistoriesByMember(Number(memberId));
    res.status(200).json({ status: 200, data });
  } catch (e: any) {
    res.status(500).json({ status: 500, message: e.message });
  }
}; */

// GET /booking-histories/community/:communityId
export const getByCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const data = await BookingHistoryService.getHistoriesByCommunity(Number(communityId));
    return createResponse(res, 201, "Get booking histories by community successfully", data);
  } catch (e: any) {
    return createErrorResponse(res, 400, e.message);
  }
};

// GET /booking-histories/member/:memberId
export const getByMember = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const data = await BookingHistoryService.getHistoriesByMember(Number(memberId));
    return createResponse(res, 201, "Get booking histories by member successfully", data);
  } catch (e: any) {
    return createErrorResponse(res, 400, e.message);
  }
};



