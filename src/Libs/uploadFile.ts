import multer from 'multer';
import fs from "fs";
import zlib from "zlib";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname
        cb(null, uniqueName)
    }
})

async function compressFile(inputPath: string, outputPath: string) {
    return new Promise((resolve, reject) => {
        const gzip = zlib.createGzip();
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);

    input.pipe(gzip).pipe(output)
        .on("finish", () => resolve(true))
        .on("error", reject);
    });
}

export {compressFile}
export const upload = multer({ storage })