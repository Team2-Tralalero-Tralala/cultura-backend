import { Router } from "express";
import { createPackage, getPackageByMemberID  } from "../Controllers/package-controller.js";

const packageRoutes = Router();

// กำหนด endpoint ตามที่คุณออกแบบ
packageRoutes.post("/createPackage", createPackage);
packageRoutes.get("/getPackageByMemberID/:memberId", getPackageByMemberID);

export default packageRoutes;