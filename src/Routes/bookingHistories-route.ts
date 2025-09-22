import { Router } from "express";
import { getByCommunity, getByMember, } from "../Controllers/bookingHistories-controller.js";

const router = Router();

router.get("/community/:communityId", getByCommunity);
router.get("/member/:memberId", getByMember);

export default router;


