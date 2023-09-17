import { Pool } from "pg";
import { CreateReviewInput } from "../models/review.model";
import {
  ItemCreateBody,
  ItemResBody,
  ItemResBodySchema,
  ItemUpdateBody,
} from "../models";

export class ItemsService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    ItemsService.pool = pool;
  }

  static async getAll(): Promise<ItemResBody[]> {
    const result = await this.pool.query("SELECT * FROM items_view");
    return result.rows.map((item) => ItemResBodySchema.parse(item));
  }

  static async createOne(item: ItemCreateBody): Promise<ItemResBody> {
    const query = `
        INSERT INTO items (category_id, brand_id, name, description, price, quantity, quantity_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        `;
    const values = [
      item.category_id,
      item.brand_id,
      item.name,
      item.description,
      item.price,
      item.quantity,
      item.quantity_type,
    ];
    const result = await this.pool.query(query, values);
    const createdItem = result.rows[0];
    return createdItem && ItemResBodySchema.parse(createdItem);
  }

  static async getOne(itemId: string): Promise<ItemResBody | null> {
    const result = await this.pool.query(
      `SELECT * FROM items_view WHERE item_id = $1`,
      [itemId]
    );
    const item = result.rows[0];
    return item && ItemResBodySchema.parse(item);
  }

  static async deleteOne(itemId: string): Promise<ItemResBody | null> {
    const result = await this.pool.query(
      "DELETE FROM items WHERE item_id = $1  RETURNING *",
      [itemId]
    );
    const deletedItem = result.rows[0];
    return deletedItem && ItemResBodySchema.parse(deletedItem);
  }

  static async updateOne(
    itemId: string,
    item: ItemUpdateBody
  ): Promise<ItemResBody | null> {
    const query = `
    UPDATE items
    SET
        category_id = COALESCE(NULLIF($1, ''), category_id::text)::uuid,
        brand_id = COALESCE(NULLIF($2, ''), brand_id::text)::uuid,
        name = COALESCE($3, name),
        description = COALESCE($4, description)
        price = COALESCE($5, price),
        quantity = COALESCE($6, quantity)
        quantity_type = COALESCE($7, quantity_type)
        WHERE item_id = $7
    RETURNING *;
    `;
    const values = [
      item.category_id,
      item.brand_id,
      item.name,
      item.description,
      item.price,
      item.quantity,
      item.quantity_type,
      itemId,
    ];
    const result = await this.pool.query(query, values);
    const updatedItem = result.rows[0];
    return updatedItem && ItemResBodySchema.parse(updatedItem);
  }

  static async addImage(
    itemId: string,
    image: string
  ): Promise<ItemResBody | null> {
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
