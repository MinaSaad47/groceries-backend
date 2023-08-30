import express from "express";
import { categoriesController } from "@api/v1/controllers";
import { validateRequest } from "@api/v1/middlewares";
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

export default router;
