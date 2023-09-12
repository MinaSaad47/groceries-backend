import { Pool } from "pg";
import {
  CategoryOutput,
  CategoryOutputSchema,
  UpdateCategoryInput,
} from "../models";

export class CategoriesService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    CategoriesService.pool = pool;
  }

  static async getAll(): Promise<CategoryOutput[]> {
    const result = await this.pool.query("SELECT * FROM categories");
    return result.rows.map((category) => CategoryOutputSchema.parse(category));
  }

  static async createOne(name: string): Promise<CategoryOutput> {
    const query = `
      INSERT INTO categories (name)
      VALUES ($1)
      RETURNING *;
    `;
    const values = [name];
    const result = await this.pool.query(query, values);
    const createdCategory = result.rows[0];
    return createdCategory && CategoryOutputSchema.parse(createdCategory);
  }

  static async getOne(categoryId: string): Promise<CategoryOutput | null> {
    const result = await this.pool.query(
      "SELECT * FROM categories WHERE category_id = $1",
      [categoryId]
    );
    const category = result.rows[0];
    return category && CategoryOutputSchema.parse(category);
  }

  static async updateOne(
    categoryId: string,
    category: UpdateCategoryInput
  ): Promise<CategoryOutput | null> {
    const query = `
      UPDATE categories
      SET
        name = COALESCE(NULLIF($1, ''), name),
        image = COALESCE(NULLIF($2, ''), image)
      WHERE category_id = $3
      RETURNING *;
    `;
    const values = [category.name, category.image, categoryId];
    const result = await this.pool.query(query, values);
    const updatedCategory = result.rows[0];
    return updatedCategory && CategoryOutputSchema.parse(updatedCategory);
  }

  static async deleteOne(categoryId: string): Promise<CategoryOutput | null> {
    const result = await this.pool.query(
      "DELETE FROM categories WHERE category_id = $1 RETURNING *",
      [categoryId]
    );
    const deletedCategory = result.rows[0];
    return deletedCategory && CategoryOutputSchema.parse(deletedCategory);
  }
}
