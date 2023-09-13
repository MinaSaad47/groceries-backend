import { Pool } from "pg";
import { BrandOutput, BrandOutputSchema, UpdateBrandInput } from "../models";

export class BrandsService {
  private static pool: Pool;

  static setPool(pool: Pool) {
    BrandsService.pool = pool;
  }

  static async getAll(): Promise<BrandOutput[]> {
    const result = await this.pool.query("SELECT * FROM brands");
    return result.rows.map((brand) => BrandOutputSchema.parse(brand));
  }

  static async createOne(name: string): Promise<BrandOutput> {
    const query = `
      INSERT INTO brands (name)
      VALUES ($1)
      RETURNING *;
    `;
    const values = [name];
    const result = await this.pool.query(query, values);
    const createdBrand = result.rows[0];
    return createdBrand && BrandOutputSchema.parse(createdBrand);
  }

  static async getOne(brandId: string): Promise<BrandOutput | null> {
    const result = await this.pool.query(
      "SELECT * FROM brands WHERE brand_id = $1",
      [brandId]
    );
    const brand = result.rows[0];
    return brand && BrandOutputSchema.parse(brand);
  }

  static async updateOne(
    brandId: string,
    brand: UpdateBrandInput
  ): Promise<BrandOutput | null> {
    const query = `
      UPDATE brands
      SET name = $1
      WHERE brand_id = $2
      RETURNING *;
    `;
    const values = [brand.name, brandId];
    const result = await this.pool.query(query, values);
    const updatedBrand = result.rows[0];
    return updatedBrand && BrandOutputSchema.parse(updatedBrand);
  }

  static async deleteOne(brandId: string): Promise<BrandOutput | null> {
    const result = await this.pool.query(
      "DELETE FROM brands WHERE brand_id = $1 RETURNING *",
      [brandId]
    );
    const deletedBrand = result.rows[0];
    return deletedBrand && BrandOutputSchema.parse(deletedBrand);
  }
}
