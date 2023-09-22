import { eq } from "drizzle-orm";
import { Database } from "../../db";
import { brands } from "../../db/schema";
import { NotFoundError } from "../../utils/errors/notfound.error";
import { CreateBrand, UpdateBrand } from "./brands.validation";

export class BrandsService {
  constructor(private db: Database) {}

  public async addOne(values: CreateBrand) {
    const [brand] = await this.db.insert(brands).values(values).returning();
    return brand;
  }

  public async getOne(brandId: string) {
    const brand = await this.db.query.brands.findFirst({
      where: eq(brands.id, brandId),
      with: { items: true },
    });
    if (!brand) {
      throw new NotFoundError("brands", brandId);
    }
    return brand;
  }

  public async deleteOne(brandId: string) {
    const [brand] = await this.db
      .delete(brands)
      .where(eq(brands.id, brandId))
      .returning();
    if (!brand) {
      throw new NotFoundError("brands", brandId);
    }
    return brand;
  }

  public async getAll() {
    return await this.db.query.brands.findMany();
  }

  public async updateOne(brandId: string, set: UpdateBrand) {
    const [brand] = await this.db
      .update(brands)
      .set(set)
      .where(eq(brands.id, brandId))
      .returning();
    if (!brand) {
      throw new NotFoundError("brands", brandId);
    }
    return brand;
  }
}
