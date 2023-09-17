import express from "express";
import { usersController } from "@api/v1/controllers";
import { requireJwt, validateRequest } from "@api/v1/middlewares";
import { z } from "zod";
import {
  UserCreateBodySchema,
  UserGetParamSchema,
  UserUpdateBodySchema,
} from "../models";

const router = express.Router();

router
  .route("/")
  .get([requireJwt], usersController.getAll)
  .post(
    [validateRequest(z.object({ body: UserCreateBodySchema }))],
    usersController.createOne
  );

router
  .route("/:user_id")
  .all([validateRequest(z.object({ params: UserGetParamSchema }))])
  .get(usersController.getOne)
  .delete(usersController.deleteOne)
  .patch(
    [validateRequest(z.object({ body: UserUpdateBodySchema }))],
    usersController.updateOne
  );

export default router;
