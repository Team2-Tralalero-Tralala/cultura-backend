import express from "express";
import dotenv from "dotenv";
import rootRouter from "./Routes/index-route.js";

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 300;

app.use("/api", rootRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
