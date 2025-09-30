// src/Controllers/account-controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  createAccount as createAccountSvc,
  editAccount as editAccountSvc,
  type CreateUserInput,
  type EditUserInput,
} from "../Services/account-service.js";

/**
 * POST /api/accounts – สร้างผู้ใช้
 */
export async function createAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Partial<CreateUserInput>;
    const required = ["roleId", "fname", "lname", "username", "email", "phone", "password"] as const;
    const missing = required.filter((k) => !(k in body));
    if (missing.length) {
      return res.status(400).json({ ok: false, error: `required fields: ${missing.join(", ")}` });
    }

    const data = await createAccountSvc({
      roleId: Number(body.roleId),
      fname: String(body.fname),
      lname: String(body.lname),
      username: String(body.username),
      email: String(body.email),
      phone: String(body.phone),
      password: String(body.password),
    });

    return res.status(201).json({ ok: true, data });
  } catch (e: any) {
    if (e?.status === 400 && e?.message === "role_not_found") {
      return res.status(400).json({ ok: false, error: "roleId not found" });
    }
    if (e?.status === 409 && e?.message === "duplicate") {
      return res.status(409).json({ ok: false, error: `duplicate: ${e.fields?.join(", ")}` });
    }
    if (e?.code === "P2002") {
      const target = Array.isArray(e?.meta?.target) ? e.meta.target.join(",") : String(e?.meta?.target || "unique");
      return res.status(409).json({ ok: false, error: `duplicate: ${target}` });
    }
    return next(e);
  }
}

/**
 * PATCH /api/accounts/:id – แก้ไขผู้ใช้ (รองรับ memberOfCommunity)
 */
export async function editAccountController(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: "invalid user id" });
  }

  const body = req.body as EditUserInput;

  try {
    const user = await editAccountSvc(id, body);
    return res.status(200).json({ ok: true, data: user });
  } catch (e: any) {
    if (e?.status === 404 && e?.message === "user_not_found") {
      return res.status(404).json({ ok: false, error: "user not found" });
    }
    if (e?.status === 409 && e?.message === "duplicate") {
      return res.status(409).json({ ok: false, error: `duplicate: ${e.fields?.join(", ")}` });
    }
    if (e?.code === "P2002") {
      const target = Array.isArray(e?.meta?.target) ? e.meta.target.join(",") : String(e?.meta?.target || "unique");
      return res.status(409).json({ ok: false, error: `duplicate: ${target}` });
    }
    return next(e);
  }
}
