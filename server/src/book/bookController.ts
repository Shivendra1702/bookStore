import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { config } from "../config/config";
import path from "node:path";
import fs from "fs";
import cloudinary from "../config/cloudinary";
import BookModel from "./bookModel";

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, genre } = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files?.coverImage || !files?.file) {
    return next(
      createHttpError(400, "Please upload a cover image and a book file")
    );
  }

  //cover upload
  const coverImageName = files?.coverImage[0].filename;
  const coverImagePath = path.resolve(
    __dirname,
    "../../public/uploads",
    coverImageName
  );
  const coverUploadResult = await cloudinary.uploader.upload(coverImagePath, {
    filename_override: coverImageName,
    folder: "book-covers",
  });

  //book file upload
  const bookFileName = files?.file[0].filename;
  const bookFilePath = path.resolve(
    __dirname,
    "../../public/uploads",
    bookFileName
  );
  const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
    resource_type: "raw",
    filename_override: bookFileName,
    folder: "book-pdfs",
    format: "pdf",
  });

  //create book
  try {
    const newBook = await BookModel.create({
      title,
      genre,
      coverImage: coverUploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
      author: "6620cfee525247299cf00a85",
    });

    //delete files
    await fs.promises.unlink(coverImagePath);
    await fs.promises.unlink(bookFilePath);

    return res
      .status(201)
      .json({ id: newBook._id, message: "Book created successfully" });
  } catch (error) {
    return next(createHttpError(500, "Failed to create book"));
  }
};
