import "module-alias/register";
// load .env file
require("dotenv").config();

// validation and openapi
import {
  OpenApiGeneratorV3,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import YAML from "yaml";

extendZodWithOpenApi(z);

import express from "express";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";

import { config } from "@config";

require("@api/v1/services/strategies");

// common middlewares
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

// internationalization
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import i18nextHttpMiddleware from "i18next-http-middleware";

// extensions
import responseExtension from "@api/v1/utils/extensions/express.ext";
import "@api/v1/utils/extensions/pg.ext";

// utilities
import logger from "@api/v1/utils/logger";

import { db, applyMigrations } from "@api/v1/db";

import { registry } from "@api/v1/utils/openapi/registery";

import { UserController } from "@api/v1/resources/users/users.controller";
import { UsersService } from "@api/v1/resources/users/users.service";

import { ItemsService } from "@api/v1/resources/items/items.service";
import { AuthController } from "@api/v1/resources/auth/auth.controller";
import { ProfileController } from "@api/v1/resources/profile/profile.controller";
import { ProfileService } from "@api/v1/resources/profile/profile.service";
import { CartsService } from "@api/v1/resources/carts/carts.service";
import { CartsController } from "@api/v1/resources/carts/carts.controller";
import { handleErrorMiddleware } from "@api/v1/middlewares/error.middleware";
import { WebhooksControoler } from "@api/v1/resources/webhooks/webhooks.controller";
import { ItemsController } from "@api/v1/resources/items/items.controller";
import { CategoriesService } from "@api/v1/resources/categories/categories.serivce";
import { CategoriesController } from "@api/v1/resources/categories/categories.controller";
import { BrandsService } from "@api/v1/resources/brands/brands.serivce";
import { BrandsController } from "@api/v1/resources/brands/brands.controller";

const isProduction = process.env.NODE_ENV === "production";
const secretOrKey = isProduction
  ? process.env.JWT_SECRET_PROD
  : process.env.JWT_SECRET_DEV;

i18next
  .use(Backend)
  .use(i18nextHttpMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "./locales/{{lng}}.json",
    },
  });

const app = express();

app.use(morgan(isProduction ? "tiny" : "dev"));
app.use(cors());
app.use("/public", express.static("public"));
app.use(i18nextHttpMiddleware.handle(i18next));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secretOrKey));
app.use(responseExtension);

async function main() {
  await applyMigrations();

  app.listen(config.app.port, () =>
    logger.info(`App is listening on port ${config.app.port}`)
  );

  const usersService = new UsersService(db);
  const profileService = new ProfileService(db);
  const itemsServices = new ItemsService(db);
  const cartsService = new CartsService(db);
  const categoriesService = new CategoriesService(db);
  const brandsService = new BrandsService(db);

  const controllers = [
    new AuthController("/auth"),
    new UserController("/api/v1/users", usersService),
    new ProfileController("/api/v1/profile", profileService),
    new ItemsController("/api/v1/items", itemsServices),
    new CartsController("/api/v1/profile/carts", cartsService),
    new CategoriesController("/api/v1/categories", categoriesService),
    new BrandsController("/api/v1/brands", brandsService),
    new WebhooksControoler("/webhooks", cartsService),
  ];

  app.post("/webhock", async (req, res) => {});

  controllers.forEach((ctrl) => app.use(ctrl.path, ctrl.router));
  app.use(handleErrorMiddleware);

  const openapi = new OpenApiGeneratorV31(registry.definitions);
  const docs = openapi.generateDocument({
    info: {
      version: "1.0.0",
      title: "groceries-backend",
      description: "api docs",
    },
    servers: [{ url: "/api/v1" }],
    openapi: "3.0.1",
  });

  app.use("/api/v1/docs", swaggerUi.serve);
  app.use("/api/v1/docs", (req, res, next) => {
    return swaggerUi.setup(docs)(req, res, next);
  });
}

main();
