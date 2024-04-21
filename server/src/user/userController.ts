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
  try {
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
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    //token generation
    const token = sign({ id: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    //response
    return res.status(200).json({
      id: newUser._id,
      accessToken: token,
      ok: true,
    });
  } catch (error) {
    return next(createHttpError(500, "Internal Server Error !!"));
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //validation
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createHttpError(400, "Please Enter all fields !"));
    }

    //database
    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(400, "Invalid Credentials !"));
    }

    //password verification
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createHttpError(400, "Invalid Credentials !"));
    }

    //token generation
    const token = sign({ id: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    //response
    return res.status(201).json({
      id: user._id,
      accessToken: token,
      ok: true,
    });
  } catch (error) {
    return next(createHttpError(500, "Internal Server Error !!"));
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return next(createHttpError(500, "Internal Server Error !!"));
  }
};
