import { Pool } from "pg";

declare module "pg" {
  interface Pool {
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
  }
}
