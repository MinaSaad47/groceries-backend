import express from "express";
import { brandsController } from "@api/v1/controllers"; // Update the import based on your BrandsController
import { validateRequest } from "@api/v1/middlewares";
import { z } from "zod";
import {
  CreateBrandInputSchema,
  GetBrandInputSchema,
  UpdateBrandInputSchema,
} from "../models"; // Update the imports based on your Brand models

const router = express.Router();

router
  .route("/")
  .get(brandsController.getAll)
  .post(
    [validateRequest(z.object({ body: CreateBrandInputSchema }))],
    brandsController.createOne
  );

router
  .route("/:brand_id")
  .all([validateRequest(z.object({ params: GetBrandInputSchema }))])
  .get(brandsController.getOne)
  .delete(brandsController.deleteOne)
  .patch(
    [validateRequest(z.object({ body: UpdateBrandInputSchema }))],
    brandsController.updateOne
  );

export default router;
