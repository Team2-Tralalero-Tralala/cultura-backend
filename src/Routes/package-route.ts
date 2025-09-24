import { Router } from "express";
import { createPackage, getPackageByMemberID, editPackage, deletePackage, getPackageByRole, createPackageDto, editPackageDto  } from "../Controllers/package-controller.js";
import { validateDto } from "~/Libs/validateDto.js";

const packageRoutes = Router();

// กำหนด endpoint ตามที่คุณออกแบบ
packageRoutes.post("/createPackage", await validateDto(createPackageDto), createPackage);
packageRoutes.get("/getPackageByRole/:id", getPackageByRole);
packageRoutes.get("/getPackageByMemberID/:id", getPackageByMemberID);
packageRoutes.put("/editPackage/:id", await validateDto(editPackageDto),editPackage);
packageRoutes.delete("/deletePackage/:id", deletePackage);
export default packageRoutes;