import type { Request, Response, NextFunction } from "express";
import {
  createAccount as createAccountSvc,
  editAccount as editAccountSvc,
  type CreateUserInput,
  type EditUserInput,
} from "../Services/create-edit-account-service.js";

/** ---------- Create ---------- */
export async function createAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Partial<CreateUserInput>;
    const required = ["roleId", "fname", "lname", "username", "email", "phone", "password"] as const;

    const missing = required.filter((k) => !(k in body));
    if (missing.length) {
      return res.status(400).json({
        ok: false,
        error: `required fields: ${missing.join(", ")}`,
      });
    }

    const data = await createAccountSvc({
      roleId: Number(body.roleId),
      fname: String(body.fname),
      lname: String(body.lname),
      username: String(body.username),
      email: String(body.email),
      phone: String(body.phone),
      password: String(body.password),
      avatarUrl: (body as any).avatarUrl ?? null,
    });

    return res.status(201).json({ ok: true, data });
  } catch (e: any) {
    if (e?.status === 400 && e?.message === "role_not_found") {
      return res.status(400).json({ ok: false, error: "roleId not found" });
    }
    if (e?.status === 409 || e?.message === "email_duplicate" || e?.code === "P2002") {
      return res.status(409).json({ ok: false, error: "email already exists" });
    }
    return next(e);
  }
}

/** ---------- Edit ---------- */
export async function editAccountController(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, error: "invalid user id" });
  }

  const body = req.body as EditUserInput;

  try {
    const user = await editAccountSvc(id, body);
    return res.status(200).json({ ok: true, data: user });
  } catch (e: any) {
    if (e?.status === 400 && e?.message === "no_changes") {
      return res.status(400).json({ ok: false, error: "no changes provided" });
    }
    if (e?.status === 400 && e?.message === "role_not_found") {
      return res.status(400).json({ ok: false, error: "roleId not found" });
    }
    if (e?.status === 404 || e?.message === "user_not_found") {
      return res.status(404).json({ ok: false, error: "user not found" });
    }
    if (e?.code === "P2002") {
      const target = Array.isArray(e?.meta?.target)
        ? e.meta.target.join(",")
        : e?.meta?.target || "unique field";
      return res.status(409).json({ ok: false, error: `${target} already exists` });
    }
    return next(e);
  }
}
