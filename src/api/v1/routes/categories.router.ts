import express from "express";
import { categoriesController } from "@api/v1/controllers";
import { uploadCategoryImage, validateRequest } from "@api/v1/middlewares";
import { z } from "zod";
import {
  CreateCategoryInputSchema,
  GetCategoryInputSchema,
  UpdateCategoryInputSchema,
} from "../models";

const router = express.Router();

router
  .route("/")
  .get(categoriesController.getAll)
  .post(
    [validateRequest(z.object({ body: CreateCategoryInputSchema }))],
    categoriesController.createOne
  );

router
  .route("/:category_id")
  .all([validateRequest(z.object({ params: GetCategoryInputSchema }))])
  .get(categoriesController.getOne)
  .delete(categoriesController.deleteOne)
  .patch(
    [validateRequest(z.object({ body: UpdateCategoryInputSchema }))],
    categoriesController.updateOne
  );

router
  .route("/:category_id/upload-image")
  .all([validateRequest(z.object({ params: GetCategoryInputSchema }))])
  .post(uploadCategoryImage, categoriesController.addImage);

export default router;
