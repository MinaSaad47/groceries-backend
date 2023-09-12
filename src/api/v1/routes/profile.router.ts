import express from "express";
import { profileController } from "@api/v1/controllers";
import {
  requireJwt,
  uploadProfilePicture,
  validateRequest,
} from "@api/v1/middlewares";
import { z } from "zod";
import { UpdateUserInputSchema } from "../models";

const router = express.Router();

router.use([requireJwt]);

router
  .route("/")
  .get(profileController.getProfile)
  .patch(
    [validateRequest(z.object({ body: UpdateUserInputSchema }))],
    profileController.updateProfile
  );

router
  .route("/upload-picture")
  .post([uploadProfilePicture], profileController.addPicture);

export default router;
