import express from "express";
import { itemsController } from "@api/v1/controllers";
import { validateRequest } from "../middlewares";
import { z } from "zod";
import {
  CreateItemInput,
  CreateItemInputSchema,
  GetItemInputSchema,
  UpdateItemInputSchema,
} from "../models";

const router = express.Router();

router
  .route("/")
  .get(itemsController.getAll)
  .post(
    [validateRequest(z.object({ body: CreateItemInputSchema }))],
    itemsController.createOne
  );

router
  .route("/:itemId")
  .all([validateRequest(z.object({ params: GetItemInputSchema }))])
  .get(itemsController.getOne)
  .delete(itemsController.deleteOne)
  .patch(
    [validateRequest(z.object({ body: UpdateItemInputSchema }))],
    itemsController.updateOne
  );

export default router;
