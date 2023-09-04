import { Pool } from "pg";
import {
  CartOutput,
  CartOutputSchema,
  CartSchema,
  ItemOutput,
  ItemOutputSchema,
} from "@api/v1/models"; // Import the appropriate item model

export class CartsService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    CartsService.pool = pool;
  }

  static async createOne(userId: string): Promise<CartOutput | null> {
    const result = await this.pool.query(
      `
        INSERT INTO carts (user_id)
        VALUES ($1)
      `,
      [userId]
    );
    const cart = result.rows[0];
    return cart && CartSchema.parse(cart);
  }

  static async getAll(userId: string): Promise<CartOutput[]> {
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
  ): Promise<CartOutput | null> {
    let result = await this.pool.query(
      `
      SELECT * FROM carts WHERE cart_id = $1 and (user_id IS NULL OR user_id = $2)
      `,
      [cartId, userId]
    );
    const cart = result.rows[0];
    if (!cart) return null;
    result = await this.pool.query(
      `
      SELECT items.item_id, items.name, cart_items.quantity, prices.price
      FROM cart_items
      INNER JOIN items ON cart_items.item_id = items.item_id
      INNER JOIN prices ON cart_items.item_id = prices.item_id
      WHERE cart_items.cart_id = $1;
      `,
      [cart.cart_id]
    );
    const items = result.rows;
    const total_price = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return CartOutputSchema.parse({ ...cart, items, total_price });
  }

  static async deleteOne(
    cartId: string,
    userId?: string
  ): Promise<CartOutput | null> {
    const result = await this.pool.query(
      "DELETE FROM carts WHERE cart_id = $1 and (user_id IS NULL OR user_id = $2) RETURNING *",
      [cartId, userId]
    );
    const cart = result.rows[0];
    return cart && CartOutputSchema.parse(cart);
  }
}
