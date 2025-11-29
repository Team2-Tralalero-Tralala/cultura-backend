import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "reflect-metadata";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import rootRouter from "./Routes/index-route.js";

const app = express();

import swaggerOptions from "./Libs/swaggerOption.js";

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:4000",
      "http://dekdee2.informatics.buu.ac.th:4080"
    ], // origin ของ front-end
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
app.use("/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
