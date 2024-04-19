import express from "express";
import { createBook } from "./bookController";
import multer from "multer";
import path from "node:path";

const bookRouter = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, "../../public/uploads"),
  limits: {
    fileSize: 3e7,
  },
});

bookRouter.post(
  "/create",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

export default bookRouter;