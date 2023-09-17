import express from "express";
import { profileController } from "@api/v1/controllers";
import {
  requireJwt,
  uploadProfilePicture,
  validateRequest,
} from "@api/v1/middlewares";
import { z } from "zod";
import { UserUpdateBodySchema } from "../models";

const router = express.Router();

router.use([requireJwt]);

router
  .route("/")
  .get(profileController.getProfile)
  .patch(
    [validateRequest(z.object({ body: UserUpdateBodySchema }))],
    profileController.updateProfile
  );

router
  .route("/upload-picture")
  .post([uploadProfilePicture], profileController.addPicture);

export default router;
