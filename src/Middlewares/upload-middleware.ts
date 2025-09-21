import type { Request, Response, NextFunction } from "express";
import { compressFile } from "~/Libs/uploadFile.js";
import path from 'path';
import fs from 'fs';

export async function compressUploadedFile( req: Request, res: Response, next: NextFunction) {
    if (!req.file) return next();

    const inputPath = path.join("uploads", req.file.filename);
    const outputPath = inputPath + ".gz";

    try {
        await compressFile(inputPath, outputPath);

        fs.unlinkSync(inputPath);

        req.file.path = outputPath;
        req.file.filename = req.file.filename + ".gz";
        next();
    } catch (err) {
        next(err);
    }
};