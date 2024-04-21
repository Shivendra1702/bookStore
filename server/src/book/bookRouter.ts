import express from "express";
import {
  createBook,
  updateBook,
  getBooks,
  getSingleBook,
  deleteBook,
} from "./bookController";
import multer from "multer";
import path from "node:path";
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, "../../public/uploads"),
  limits: {
    fileSize: 3e7,
  },
});

bookRouter.post(
  "/create",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

bookRouter.patch(
  "/update/:id",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

bookRouter.get("/", getBooks);

bookRouter.get("/:id", getSingleBook);

bookRouter.delete("/:id", authenticate, deleteBook);

export default bookRouter;
