import { Pool, types } from "pg";
import { config } from "../../../config";

types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));

export const pool = new Pool({ connectionString: config.db.url });
