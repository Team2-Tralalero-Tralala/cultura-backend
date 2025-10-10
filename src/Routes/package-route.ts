import express from "express";
import { getDraftPackagesController } from "../Controllers/package-controller.js";

const router = express.Router();

router.get("/packages/draft", getDraftPackagesController);

export default router;