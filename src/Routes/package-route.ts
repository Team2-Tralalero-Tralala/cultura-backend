import { Router } from "express";
import { createPackage, getPackageByMemberID, editPackage, deletePackage, getPackageByRole  } from "../Controllers/package-controller.js";

const packageRoutes = Router();

// กำหนด endpoint ตามที่คุณออกแบบ
packageRoutes.post("/createPackage", createPackage);
packageRoutes.get("/getPackageByRole/:id", getPackageByRole);
packageRoutes.get("/getPackageByMemberID/:id", getPackageByMemberID);
packageRoutes.put("/editPackage/:id", editPackage);
packageRoutes.delete("/deletePackage/:id", deletePackage);
export default packageRoutes;