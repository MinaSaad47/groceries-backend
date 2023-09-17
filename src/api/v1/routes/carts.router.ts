import express from "express";
import { cartsController, favoritesController } from "@api/v1/controllers";
import { requireJwt, validateRequest } from "@api/v1/middlewares";
import { z } from "zod";
import {
  CartAddItemBodySchema,
  CartGetParamSchema,
  CreateFavoriteSchema,
  DeleteFavoriteSchema,
} from "@api/v1/models";

const router = express.Router();

router.use(requireJwt);

router.route("/").get(cartsController.getAll).post(cartsController.createOne);

router
  .route("/:cart_id")
  .all([validateRequest(z.object({ params: CartGetParamSchema }))])
  .delete(cartsController.deleteOne)
  .get(cartsController.getOne);

router
  .route("/:cart_id/items")
  .all([
    validateRequest(
      z.object({ params: CartGetParamSchema, body: CartAddItemBodySchema })
    ),
  ])
  .post(cartsController.addItem);

router
  .route("/:cart_id/items/:item_id")
  .all([validateRequest(z.object({ params: CartGetParamSchema }))])
  .delete(cartsController.removeItem)
  .patch(cartsController.updateItem);

export default router;
