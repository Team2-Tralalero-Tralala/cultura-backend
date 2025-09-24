import { Router } from "express";
import { getUserById, getUserByStatus, deleteAccount, blockAccount } from "../Controllers/user-controller.js";

const userRoutes = Router();

userRoutes.get("/getUserById/:id", getUserById);

userRoutes.get("/getUserByStatus/:status", getUserByStatus);

userRoutes.delete("/deleteAccount/:id", deleteAccount);

userRoutes.put("/blockAccount/:id", blockAccount); 

export default userRoutes;