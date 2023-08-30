import express from "express";
import { itemsController } from "@api/v1/controllers";
import { validateRequest } from "@api/v1/middlewares";
import { z } from "zod";
import {
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
  .route("/:item_id")
  .all([validateRequest(z.object({ params: GetItemInputSchema }))])
  .get(itemsController.getOne)
  .delete(itemsController.deleteOne)
  .patch(
    [validateRequest(z.object({ body: UpdateItemInputSchema }))],
    itemsController.updateOne
  );

export default router;
