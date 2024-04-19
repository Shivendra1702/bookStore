import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { config } from "../config/config";
import { BookModel } from "./bookModel";

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json({ message: "Book created successfully" });
  } catch (error) {
    return next(createHttpError(500, "Internal Server Error !!"));
  }
};
