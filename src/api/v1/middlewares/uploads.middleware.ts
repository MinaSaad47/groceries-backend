import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { GetCategoryInput, UserOutput } from "../models";
import { Request } from "express";

export const uploadProfilePicture = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const user = req.user as UserOutput;
      const directory = `public/profiles/${user.user_id}`;
      try {
        await fs.mkdir(directory, { recursive: true });
        cb(null, directory);
      } catch (error: any) {
        cb(error, directory);
      }
    },
    filename: function (req, file, cb) {
      const user = req.user as UserOutput;
      cb(null, "picture" + path.extname(file.originalname));
    },
  }),
}).single("picture");

export const uploadCategoryImage = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      req = req as Request<GetCategoryInput>;
      const user = req.user as UserOutput;
      const directory = `public/categories/${req.params.category_id}`;
      try {
        await fs.mkdir(directory, { recursive: true });
        cb(null, directory);
      } catch (error: any) {
        cb(error, directory);
      }
    },
    filename: function (req, file, cb) {
      const user = req.user as UserOutput;
      cb(null, "image" + path.extname(file.originalname));
    },
  }),
}).single("image");
