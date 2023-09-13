import { Pool } from "pg";
import { CreateReviewInput } from "../models/review.model";
import {
  CreateItemInput,
  ItemOutput,
  ItemOutputSchema,
  UpdateItemInput,
} from "../models";

export class ItemsService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    ItemsService.pool = pool;
  }

  static async getAll(): Promise<ItemOutput[]> {
    const result = await this.pool.query("SELECT * FROM items_view");
    return result.rows.map((item) => ItemOutputSchema.parse(item));
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
    const createdItem = result.rows[0];
    return createdItem && ItemOutputSchema.parse(createdItem);
  }

  static async getOne(itemId: string): Promise<ItemOutput | null> {
    const result = await this.pool.query(
      `SELECT * FROM items_view WHERE item_id = $1`,
      [itemId]
    );
    const item = result.rows[0];
    return item && ItemOutputSchema.parse(item);
  }

  static async deleteOne(itemId: string): Promise<ItemOutput | null> {
    const result = await this.pool.query(
      "DELETE FROM items WHERE item_id = $1  RETURNING *",
      [itemId]
    );
    const deletedItem = result.rows[0];
    return deletedItem && ItemOutputSchema.parse(deletedItem);
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
        name = COALESCE($3, name),
        description = COALESCE($4, description)
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
    const updatedItem = result.rows[0];
    return updatedItem && ItemOutputSchema.parse(updatedItem);
  }

  static async addImage(
    itemId: string,
    image: string
  ): Promise<ItemOutput | null> {
    const query = `
    INSERT INTO item_images (item_id, image)
    VALUES ($1, $2)
    RETURNING *;
    `;

    let result = await this.pool.query(query, [itemId, image]);

    console.log(result);
    if (result.rows.length < 1) {
      return null;
    }

    return await this.getOne(itemId);
  }
}
