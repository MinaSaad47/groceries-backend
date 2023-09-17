import { Pool } from "pg";
import {
  CartResBody,
  CartOutputSchema,
  CartSchema,
  ItemResBody,
  ItemResBodySchema,
} from "@api/v1/models";

export class CartsService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    CartsService.pool = pool;
  }

  static async createOne(userId: string): Promise<CartResBody | null> {
    const cart = await this.pool.transaction(async (client) => {
      let result = await client.query(
        `
        INSERT INTO carts (user_id)
        VALUES ($1)
        RETURNING *;
      `,
        [userId]
      );
      result = await client.query(
        `
        SELECT *
        FROM carts_view
        WHERE cart_id = $1
        `,
        [result.rows[0].cart_id]
      );
      return await result.rows[0];
    });
    return cart as CartResBody;
  }

  static async getAll(userId: string): Promise<CartResBody[]> {
    const result = await this.pool.query(
      "SELECT * FROM carts WHERE user_id = $1",
      [userId]
    );
    return result.rows.map((cart) => CartOutputSchema.parse(cart));
  }

  static async addItem(
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<boolean> {
    const result = await this.pool.query(
      `
      INSERT INTO cart_items (cart_id, item_id, quantity)
      VALUES ($1, $2, $3)  
      `,
      [cartId, itemId, quantity]
    );
    const cart_item = result.rows[0];
    return !cart_item ? false : true;
  }

  static async removeItem(cartId: string, itemId: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM cart_items WHERE cart_id = $1 and item_id = $2 RETURNING *",
      [cartId, itemId]
    );
    const cart_item = result.rows[0];
    return !cart_item ? false : true;
  }

  static async updateItem(
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<boolean> {
    const result = await this.pool.query(
      "ALTER cart_items SET QUANTITY = $3 WHERE cart_id = $1 and item_id = $2 RETURNING *",
      [cartId, itemId, quantity]
    );
    const cart_item = result.rows[0];
    return !cart_item ? false : true;
  }

  static async getOne(
    cartId: string,
    userId?: string
  ): Promise<CartResBody | null> {
    let result = await this.pool.query(
      `
      SELECT *
      FROM carts_view
      WHERE cart_id = $1 AND (carts_view.user::json->>'user_id') = $2
      `,
      [cartId, userId]
    );
    const cart = result.rows[0];
    return CartOutputSchema.parse(cart);
  }

  static async deleteOne(
    cartId: string,
    userId?: string
  ): Promise<CartResBody | null> {
    const result = await this.pool.query(
      "DELETE FROM carts WHERE cart_id = $1 and (user_id IS NULL OR user_id = $2) RETURNING *",
      [cartId, userId]
    );
    const cart = result.rows[0];
    return cart && CartOutputSchema.parse(cart);
  }
}
