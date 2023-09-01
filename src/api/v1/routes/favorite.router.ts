import express from "express";
import { favoritesController } from "@api/v1/controllers"; // Update the import based on your FavoritesController
import { requireJwt, validateRequest } from "@api/v1/middlewares"; // Update the imports based on your middlewares
import { z } from "zod";
import { CreateFavoriteSchema, DeleteFavoriteSchema } from "@api/v1/models";

const router = express.Router();

router.use(requireJwt);

router
  .route("/")
  .get(favoritesController.getAll)
  .post(
    [validateRequest(z.object({ body: CreateFavoriteSchema }))],
    favoritesController.addOne
  );

router
  .route("/:item_id")
  .all([validateRequest(z.object({ params: DeleteFavoriteSchema }))])
  .delete(favoritesController.deleteOne);

export default router;
