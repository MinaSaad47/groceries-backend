import { Express, Request, Response } from "express";

import itemsRouter from "./items.router";
import usersRouter from "./users.router";
import categoriesRouter from "./categories.router";
import brandsRouter from "./brands.router";
import authRouter from "./auth.router";
import favoratesRouter from "./favorite.router";

export default function routes(app: Express) {
  app.get("/health_check", (req: Request, res: Response) =>
    res.sendStatus(200)
  );

  app.use("/auth", authRouter);

  app.use("/api/v1/items", itemsRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/brands", brandsRouter);
  app.use("/api/v1/favorites", favoratesRouter);
}
