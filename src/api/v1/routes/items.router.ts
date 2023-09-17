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
  ItemCreateBodySchema,
  CreateReviewInputSchema,
  ItemGetParamSchema,
  ItemUpdateBodySchema,
} from "../models";

const router = express.Router();
/**
 * @swagger
 * /api/v1/items:
 *   get:
 *     tags:
 *     - Items
 *     summary: Get all items
 *     description: Retrieve a list of all items.
 *     responses:
 *       200:
 *         description: A list of items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ItemOutput'
 *   post:
 *     tags:
 *     - Items
 *     summary: Create a new item
 *     description: Create a new item.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemInput'
 *     responses:
 *       201:
 *         description: The created item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemOutput'
 */
router
  .route("/")
  .get(itemsController.getAll)
  .post(
    [validateRequest(z.object({ body: ItemCreateBodySchema }))],
    itemsController.createOne
  );

router
  .route("/:item_id")
  .all([validateRequest(z.object({ params: ItemGetParamSchema }))])
  .get(itemsController.getOne)
  .delete(itemsController.deleteOne)
  .patch(
    [validateRequest(z.object({ body: ItemUpdateBodySchema }))],
    itemsController.updateOne
  );

router
  .route("/:item_id/upload-thumbnail")
  .all([validateRequest(z.object({ params: ItemGetParamSchema }))])
  .post(uploadItemThumbnail, itemsController.addThumbnail);

router
  .route("/:item_id/upload-image")
  .all([validateRequest(z.object({ params: ItemGetParamSchema }))])
  .post(uploadItemImage, itemsController.addImage);

router
  .route("/:item_id/reviews")
  .all([requireJwt, validateRequest(z.object({ params: ItemGetParamSchema }))])
  .get(itemsController.getAllReview)
  .post(
    [validateRequest(z.object({ body: CreateReviewInputSchema }))],
    itemsController.addReview
  );

export default router;
