import { Router } from "express";
import { createAccount, editAccountController } from "../Controllers/create-edit-account-controller.js";
import { getMemberByAdmin } from "../Controllers/getMemberByAdmin-controller.js";
const router = Router();

router.post("/accounts", createAccount);
router.patch("/accounts/:id", editAccountController);
router.get("/admin/members", getMemberByAdmin);

export default router;
