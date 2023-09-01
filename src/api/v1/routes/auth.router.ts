import { Router } from "express";
import passport from "passport";
import { authController } from "../controllers";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    session: false,
  }),
  authController.login
);

export default router;
