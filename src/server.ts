import "reflect-metadata";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
import rootRouter from "./Routes/index-route.js";

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
app.use("/uploads", express.static("uploads"));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.send("Hello World from cultura.com");
});

app.use("/api", rootRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
