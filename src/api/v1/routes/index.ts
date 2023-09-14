import { Express, Request, Response } from "express";

import itemsRouter from "./items.router";
import usersRouter from "./users.router";
import categoriesRouter from "./categories.router";
import brandsRouter from "./brands.router";
import authRouter from "./auth.router";
import favoratesRouter from "./favorite.router";
import profileRouter from "./profile.router";
import addressesRouter from "./addresses.router";
import { requireJwt } from "../middlewares";

export default function routes(app: Express) {
  /**
   * @swagger
   * /health-check:
   *  get:
   *    tags:
   *    - HealthCheck
   *    summary: Health Check
   *    description: Endpoint to check the health of the API.
   *    responses:
   *      200:
   *        description: The API is healthy.
   */
  app.get("/health-check", (req: Request, res: Response) =>
    res.sendStatus(200)
  );

  app.use("/auth", authRouter);

  app.use("/api/v1/items", itemsRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/brands", brandsRouter);
  app.use("/api/v1/favorites", favoratesRouter);
  app.use("/api/v1/profile", profileRouter);
  app.use("/api/v1/addresses", addressesRouter);
}
