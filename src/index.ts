import "module-alias/register";
require("dotenv").config();

import express from "express";
import { config } from "@config";
import routes from "@api/v1/routes";
import logger from "@api/v1/utils/logger";
import { pool } from "@api/v1/db";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
  AddressesService,
  BrandsService,
  CartsService,
  CategoriesService,
  ItemsService,
  UsersService,
} from "@api/v1/services";
import { FavoritesService } from "@api/v1/services";

ItemsService.setPool(pool);
CategoriesService.setPool(pool);
BrandsService.setPool(pool);
UsersService.setPool(pool);
FavoritesService.setPool(pool);
CartsService.setPool(pool);
AddressesService.setPool(pool);

require("@api/v1/services/strategies");

const isProduction = process.env.NODE_ENV === "production";
const secretOrKey = isProduction
  ? process.env.JWT_SECRET_PROD
  : process.env.JWT_SECRET_DEV;

const app = express();

app.use(cors());
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secretOrKey));

async function main() {
  logger.debug(`Config: ${JSON.stringify(config, null, 4)}`);
  app.listen(config.app.port, () =>
    logger.info(`App is listening on port ${config.app.port}`)
  );
  routes(app);
}

main();
