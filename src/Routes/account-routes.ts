import { Router } from "express";
import { createAccount, editAccountController } from "../Controllers/account-controller.js";
import { getCommunityMembers } from "../Controllers/admin-members.controller.js";

import { validateBody } from "../Middlewares/validate.js";
import { CreateAccountDto, EditAccountDto } from "../Validators/account.dto.js";

const router = Router();

// Accounts
router.post("/accounts", validateBody(CreateAccountDto),createAccount);
router.patch("/accounts/:id", validateBody(EditAccountDto),editAccountController);

// Admin → community members
router.get("/admin/communities/:communityId/members", getCommunityMembers);

export default router;
