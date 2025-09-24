import { Router } from "express";
import { getUserById, getUserByStatus, deleteAccount, blockAccount } from "../Controllers/user-controller.js";

const userRoutes = Router();

userRoutes.get("/:id", getUserById);

userRoutes.get("/status/:status", getUserByStatus);

userRoutes.delete("/:id", deleteAccount);

userRoutes.put("/block/:id", blockAccount); 

export default userRoutes;