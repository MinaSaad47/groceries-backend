import { Pool } from "pg";
import { CreateItemInput, ItemOutput, UpdateItemInput } from "../models";

export class ItemsService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    ItemsService.pool = pool;
  }

  static async getAll(): Promise<ItemOutput[]> {
    const result = await this.pool.query("SELECT * FROM items");
    return result.rows;
  }

  static async createOne(item: CreateItemInput): Promise<ItemOutput> {
    const query = `
        INSERT INTO items (category_id, brand_id, name, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `;
    const values = [
      item.category_id,
      item.brand_id,
      item.name,
      item.description,
    ];
    const result = await this.pool.query(query, values);

    return result.rows[0];
  }

  static async getOne(itemId: string): Promise<ItemOutput | null> {
    const items = await this.pool.query(
      "SELECT * FROM items WHERE item_id = $1",
      [itemId]
    );
    return items.rows[0];
  }

  static async deleteOne(itemId: string): Promise<ItemOutput | null> {
    const result = await this.pool.query(
      "DELETE FROM items WHERE item_id = $1  RETURNING *",
      [itemId]
    );
    return result.rows[0];
  }

  static async updateOne(
    itemId: string,
    item: UpdateItemInput
  ): Promise<ItemOutput | null> {
    const query = `
    UPDATE items
    SET
        category_id = COALESCE(NULLIF($1, ''), category_id::text)::uuid,
        brand_id = COALESCE(NULLIF($2, ''), brand_id::text)::uuid,
        name = COALESCE(NULLIF($3, ''), name),
        description = COALESCE(NULLIF($4, ''), description)
        WHERE item_id = $5
    RETURNING *;
    `;
    const values = [
      item.category_id,
      item.brand_id,
      item.name,
      item.description,
      itemId,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
}
