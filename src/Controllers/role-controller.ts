import type { Request, Response } from "express";
import * as RoleService from "../Services/role-service.js";

export const create = async (req: Request, res: Response) => {
  try {
    const result = await RoleService.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};