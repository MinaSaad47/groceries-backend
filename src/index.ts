import "module-alias/register";
// load .env file
require("dotenv").config();

import express from "express";

import { config } from "@config";
import { pool } from "@api/v1/db";

// routes
import routes from "@api/v1/routes";

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
import swaggerDocs from "@api/v1/utils/swagger";
import logger from "@api/v1/utils/logger";

// services
import {
  AddressesService,
  BrandsService,
  CartsService,
  CategoriesService,
  ItemsService,
  ReviewsService,
  UsersService,
  FavoritesService,
} from "@api/v1/services";

ItemsService.setPool(pool);
CategoriesService.setPool(pool);
BrandsService.setPool(pool);
UsersService.setPool(pool);
FavoritesService.setPool(pool);
CartsService.setPool(pool);
AddressesService.setPool(pool);
ReviewsService.setPool(pool);
CartsService.setPool(pool);

require("@api/v1/services/strategies");

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
  logger.debug(`Config: ${JSON.stringify(config, null, 4)}`);
  app.listen(config.app.port, () =>
    logger.info(`App is listening on port ${config.app.port}`)
  );
  routes(app);
  swaggerDocs(app, config.app.port);
}

main();
