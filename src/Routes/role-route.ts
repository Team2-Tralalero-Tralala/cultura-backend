import { Router } from "express";
import { create } from "../Controllers/role-controller.js";

const roleRoutes = Router();

roleRoutes.post("/create", create);

export default roleRoutes;
