import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorHandler";

import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import { config } from "./config/config";

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
  })
);
app.use(express.json());

app.get("/", (req, res, next) => {
  res.json({ message: "Welcome to the API" });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

app.use(globalErrorHandler);

export default app;
