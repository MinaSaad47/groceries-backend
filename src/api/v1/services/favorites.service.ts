import { Pool } from "pg";
import { ItemOutput, ItemOutputSchema } from "@api/v1/models"; // Import the appropriate item model
import logger from "../utils/logger";

export class FavoritesService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    FavoritesService.pool = pool;
  }

  static async getAll(userId: string): Promise<ItemOutput[]> {
    const result = await this.pool.query(
      "SELECT items.* FROM favorites JOIN items ON favorites.item_id = items.item_id WHERE favorites.user_id = $1",
      [userId]
    );
    return result.rows.map((item) =>
      ItemOutputSchema.parse({ ...item, is_favorite: true })
    );
  }

  static async addOne(
    userId: string,
    itemId: string
  ): Promise<ItemOutput | null> {
    const query1 = `
        INSERT INTO favorites (user_id, item_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const query2 = `SELECT * FROM items WHERE item_id = $1`;

    const client = await this.pool.connect();
    let item: ItemOutput | null = null;
    try {
      await client.query("BEGIN");
      const result1 = await client.query(query1, [userId, itemId]);
      itemId = result1.rows[0].item_id;
      console.log(result1);
      const result2 = await client.query(query2, [itemId]);
      await client.query("COMMIT");
      const favoritedItem = { ...result2.rows[0], is_favorite: true };
      item = favoritedItem && ItemOutputSchema.parse(favoritedItem);
    } catch (error) {
      logger.error(error);
      await client.query("ROLLBACK");
    }
    return item;
  }

  static async deleteOne(
    userId: string,
    itemId: string
  ): Promise<ItemOutput | null> {
    const query1 = `
      DELETE FROM favorites
      WHERE user_id = $1 AND item_id = $2
      RETURNING *;
    `;
    const query2 = `SELECT * FROM items WHERE item_id = $1`;

    const client = await this.pool.connect();
    let item: ItemOutput | null = null;
    try {
      await client.query("BEGIN");
      const result1 = await client.query(query1, [userId, itemId]);
      itemId = result1.rows[0].item_id;
      console.log(result1);
      const result2 = await client.query(query2, [itemId]);
      await client.query("COMMIT");
      const favoritedItem = { ...result2.rows[0], is_favorite: false };
      item = favoritedItem && ItemOutputSchema.parse(favoritedItem);
    } catch (error) {
      logger.error(error);
      await client.query("ROLLBACK");
    }
    return item;
  }
}
