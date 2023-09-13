import express from "express";
import { itemsController } from "@api/v1/controllers";
import {
  requireJwt,
  uploadItemImage,
  uploadItemThumbnail,
  validateRequest,
} from "@api/v1/middlewares";
import { z } from "zod";
import {
  CreateItemInputSchema,
  CreateReviewInputSchema,
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

router
  .route("/:item_id/upload-thumbnail")
  .all([validateRequest(z.object({ params: GetItemInputSchema }))])
  .post(uploadItemThumbnail, itemsController.addThumbnail);

router
  .route("/:item_id/upload-image")
  .all([validateRequest(z.object({ params: GetItemInputSchema }))])
  .post(uploadItemImage, itemsController.addImage);

router
  .route("/:item_id/reviews")
  .all([requireJwt, validateRequest(z.object({ params: GetItemInputSchema }))])
  .get(itemsController.getAllReview)
  .post(
    [validateRequest(z.object({ body: CreateReviewInputSchema }))],
    itemsController.addReview
  );

export default router;
