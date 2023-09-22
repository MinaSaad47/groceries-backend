import { eq } from "drizzle-orm";
import { Database } from "../../db";
import { categories } from "../../db/schema";
import { CreateCategory, UpdateCategory } from "./categories.validation";
import { NotFoundError } from "../../utils/errors/notfound.error";

export class CategoriesService {
  constructor(private db: Database) {}

  public async addOne(values: CreateCategory) {
    const [category] = await this.db
      .insert(categories)
      .values(values)
      .returning();
    return category;
  }

  public async deleteOne(categoryId: string) {
    const [category] = await this.db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning();
    if (!category) {
      throw new NotFoundError("categories", categoryId);
    }
    return category;
  }

  public async getAll() {
    return await this.db.query.categories.findMany();
  }

  public async updateOne(
    categoryId: string,
    set: UpdateCategory & { image?: string }
  ) {
    const [category] = await this.db
      .update(categories)
      .set(set)
      .where(eq(categories.id, categoryId))
      .returning();
    if (!category) {
      throw new NotFoundError("categories", categoryId);
    }
    return category;
  }

  public async getOne(categoryId: string) {
    const category = await this.db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
      with: { items: true },
    });
    if (!category) {
      throw new NotFoundError("categories", categoryId);
    }
    return category;
  }
}
