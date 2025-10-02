import "reflect-metadata";
import express from "express";
import rootRouter from "./Routes/index-route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { compressUploadedFile } from "./Middlewares/upload-middleware.js";
import { upload, uploadPublic } from "./Libs/uploadFile.js";

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:4000", // origin ของ front-end
    credentials: true, // อนุญาตให้ส่ง cookie/header credentials
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.send("Hello World from cultura.com");
});

app.use("/api", rootRouter);

// Route สำหรับทดสอบอัปโหลดไฟล์
app.post("/upload", uploadPublic.single("file"), (req, res) => {
    if (!req.file) {
        return res.json({status: 400, message: 'file not found'})
    }

  res.json({
      originalname: req.file.originalname,
      compressedFile: req.file.filename,
      path: req.file.path,
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
