// file-utils.ts
import fs from "fs";
import path from "path";

export const CWD = process.cwd();
export const PUBLIC_ROOT = path.join(CWD, "public");
export const UPLOADS_ROOT = path.join(CWD, "uploads");

export async function ensureDir(dir: string) {
    await fs.promises.mkdir(dir, { recursive: true });
}

export async function deleteFileIfExists(absPath: string) {
    try {
        await fs.promises.unlink(absPath);
    } catch (e: any) {
        if (e?.code !== "ENOENT") throw e;
    }
}

/** แปลงเป็น absolute path ตาม prefix: public/… หรือ uploads/… (รองรับ /public/ ด้วย) */
export function toStorageAbsPath(p: string) {
    const raw = p.replace(/\\/g, "/");
    let candidate: string;

    if (raw.startsWith("/public/")) {
        candidate = path.join(PUBLIC_ROOT, raw.slice("/public/".length));
    } else if (raw.startsWith("public/")) {
        candidate = path.join(PUBLIC_ROOT, raw.slice("public/".length));
    } else if (raw.startsWith("/uploads/")) {
        candidate = path.join(UPLOADS_ROOT, raw.slice("/uploads/".length));
    } else if (raw.startsWith("uploads/")) {
        candidate = path.join(UPLOADS_ROOT, raw.slice("uploads/".length));
    } else if (path.isAbsolute(raw)) {
        candidate = raw;
    } else {
        // ถ้าไม่ระบุ prefix ชัดเจน ให้โยน error เพื่อกันพลาด
        throw new Error(`Path must start with "public/" หรือ "uploads/": ${raw}`);
    }

    return path.resolve(candidate);
}
