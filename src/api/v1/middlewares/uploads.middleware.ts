import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { GetCategoryInput, GetItemInput, UserOutput } from "../models";
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

export const uploadItemImage = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const user = req.user as UserOutput;
      const directory = `public/items/${req.params.item_id}`;
      try {
        await fs.mkdir(directory, { recursive: true });
        cb(null, directory);
      } catch (error: any) {
        cb(error, directory);
      }
    },
    filename: function (req, file, cb) {
      const user = req.user as UserOutput;
      cb(null, crypto.randomUUID() + path.extname(file.originalname));
    },
  }),
}).single("image");

export const uploadItemThumbnail = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const user = req.user as UserOutput;
      const directory = `public/items/${req.params.item_id}`;
      try {
        await fs.mkdir(directory, { recursive: true });
        cb(null, directory);
      } catch (error: any) {
        cb(error, directory);
      }
    },
    filename: function (req, file, cb) {
      const user = req.user as UserOutput;
      cb(null, "thumbnail" + path.extname(file.originalname));
    },
  }),
}).single("thumbnail");
