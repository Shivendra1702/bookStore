import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import path from "node:path";
import fs from "fs";
import cloudinary from "../config/cloudinary";
import BookModel from "./bookModel";

export interface AuthRequest extends Request {
  userId: string;
}

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
  try {
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
    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    const _req = req as AuthRequest;

    //create book
    const newBook = await BookModel.create({
      title,
      genre,
      coverImage: coverUploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
      author: _req.userId,
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

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, genre } = req.body;
  const bookId = req.params.id;

  const book = await BookModel.findById({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(
      createHttpError(403, "You are not authorized to update this book")
    );
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  let newCoverImage = "";
  if (files?.coverImage) {
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
    newCoverImage = coverUploadResult.secure_url;
    await fs.promises.unlink(coverImagePath);
  }

  let newFile = "";
  if (files?.file) {
    const bookFileName = files?.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/uploads",
      bookFileName
    );
    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );
    newFile = bookFileUploadResult.secure_url;
    await fs.promises.unlink(bookFilePath);
  }

  try {
    await BookModel.findByIdAndUpdate(bookId, {
      title: title || book.title,
      genre: genre || book.genre,
      coverImage: newCoverImage || book.coverImage,
      file: newFile || book.file,
    });

    return res.json({ message: "Book updated successfully" });
  } catch (error) {
    return next(createHttpError(500, "Failed to update book"));
  }
};

export const getBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // /api/books?page=1&limit=10
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const books = await BookModel.find()
      .populate("author", "name email")
      .skip(skip)
      .limit(limit);

    return res.json(books);
  } catch (error) {
    return next(createHttpError(500, "Failed to fetch books !!"));
  }
};

export const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.id;

  try {
    const book = await BookModel.findById(bookId).populate(
      "author",
      "name email"
    );

    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    return res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Failed to fetch book !!"));
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.id;

    const book = await BookModel.findById({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(
        createHttpError(403, "You are not authorized to delete this book")
      );
    }

    const coverImageSplits = book.coverImage.split("/");
    const coverPublicId =
      coverImageSplits.at(-2) + "/" + coverImageSplits.at(-1)?.split(".")[0];

    const fileSplits = book.file.split("/");
    const filePublicId = fileSplits.at(-2) + "/" + fileSplits.at(-1);

    console.log(coverPublicId);
    console.log(filePublicId);

    await cloudinary.uploader.destroy(coverPublicId);
    await cloudinary.uploader.destroy(filePublicId, {
      resource_type: "raw",
    });

    await BookModel.findByIdAndDelete({ _id: bookId });

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return next(createHttpError(500, "Failed to delete book !!"));
  }
};
