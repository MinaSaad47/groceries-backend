import express from "express";
import { usersController } from "@api/v1/controllers";
import { validateRequest } from "@api/v1/middlewares";
import { z } from "zod";
import {
  CreateUserInputSchema,
  GetUserInputSchema,
  UpdateUserInputSchema,
} from "../models";

const router = express.Router();

router
  .route("/")
  .get(usersController.getAll)
  .post(
    [validateRequest(z.object({ body: CreateUserInputSchema }))],
    usersController.createOne
  );

router
  .route("/:user_id")
  .all([validateRequest(z.object({ params: GetUserInputSchema }))])
  .get(usersController.getOne)
  .delete(usersController.deleteOne)
  .patch(
    [validateRequest(z.object({ body: UpdateUserInputSchema }))],
    usersController.updateOne
  );

export default router;
