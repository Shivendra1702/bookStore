import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { JwtPayload, verify } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");
  if (!token) {
    return next(createHttpError(401, "Please login to access this resource"));
  }

  try {
    const parsedToken = token.split(" ")[1];
    const decoded = verify(
      parsedToken,
      config.jwtSecret as string
    ) as JwtPayload;
    const _req = req as AuthRequest;
    _req.userId = decoded.id as string;
  } catch (error) {
    return next(createHttpError(401, "Please login to access this resource"));
  }

  next();
};

export default authenticate;
