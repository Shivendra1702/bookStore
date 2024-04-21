import express from "express";
import { createUser, loginUser,getUsers } from "./userController";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/",getUsers);

export default userRouter;
