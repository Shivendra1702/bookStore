import { User } from "../user/userTypes";

export interface Book {
  _id: string;
  title: string;
  author: string;
  genre: User;
  coverImage: string;
  file: string;
  createdAt: Date;
  updatedAt: Date;
}
