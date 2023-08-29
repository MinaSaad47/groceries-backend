import { Express, Request, Response } from "express";

import itemsRouter from "./items.router";

export default function routes(app: Express) {
  app.get("/health_check", (req: Request, res: Response) =>
    res.sendStatus(200)
  );

  app.use("/api/v1/items", itemsRouter);
}
