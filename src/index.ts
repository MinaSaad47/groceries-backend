import "module-alias/register";
require("dotenv").config();

import express from "express";
import { config } from "@config";
import routes from "@api/v1/routes";
import logger from "@api/v1/utils/logger";
import { ItemsService } from "@api/v1/services";
import { pool } from "@api/v1/db";
// import pino from "pino-http";

ItemsService.setPool(pool);

const app = express();

// app.use(pino());
app.use(express.json());

async function main() {
  logger.debug(`Config: ${JSON.stringify(config, null, 4)}`);
  app.listen(config.app.port, () =>
    logger.info(`App is listening on port ${config.app.port}`)
  );
  routes(app);
}

main();
