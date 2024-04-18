import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import User from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //validation
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = createHttpError(400, "Please Enter all fields !");
    return next(error);
  }

  //database call
  const user = await User.findOne({ email });

  if (user) {
    const error = createHttpError(400, "User Already Exists !");
    return next(error);
  }

  //password hashing
  const hashedPassword = await bcrypt.hash(password, 12);

  //process
  const newUser = await User.create({ name, email, password: hashedPassword });

  //token generation
  const token = sign({ id: newUser._id }, config.jwtSecret as string, {
    expiresIn: "7d",
  });

  //response
  return res.json({
    id: newUser._id,
    accessToken: token,
    message: "User Created Successfully !",
  });
};
