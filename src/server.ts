import express from "express";
import dotenv from "dotenv/config";
import rootRouter from "./Routes/index-route.js";

const app = express();
app.use(express.json());
const port = process.env.PORT || 300;

app.get('/', (req, res) => {
  return res.send("Hello World from cultura.com");
})

app.use("/api", rootRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
