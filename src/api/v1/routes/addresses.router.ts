import express from "express";
import { addressesController } from "@api/v1/controllers";
import { requireJwt, validateRequest } from "@api/v1/middlewares";
import { z } from "zod";
import { CreateAddressInputSchema, DeleteAddressSchema } from "@api/v1/models";

const router = express.Router();

router.use(requireJwt);

router
  .route("/")
  .get(addressesController.getAll)
  .post(
    [validateRequest(z.object({ body: CreateAddressInputSchema }))],
    addressesController.createOne
  );

router
  .route("/:address_id")
  .all([validateRequest(z.object({ params: DeleteAddressSchema }))])
  .delete(addressesController.deleteOne);

export default router;
