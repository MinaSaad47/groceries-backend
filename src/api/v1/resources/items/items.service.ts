import { Database } from "@api/v1/db";
import { images, items, reviews } from "@api/v1/db/schema";
import { ImageUploadService } from "@api/v1/services/image_upload.service";
import { NotFoundError } from "@api/v1/utils/errors/notfound.error";
import { eq } from "drizzle-orm";
import { CreateItem, CreateItemReview, UpdateItem } from "./items.validation";

export class ItemsService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getAll() {
    return await this.db.query.items.findMany();
  }

  public async createOne(body: CreateItem) {
    return await this.db.transaction(async (tx) => {
      const [item] = await tx.insert(items).values(body).returning();
      return await tx.query.items.findFirst({
        where: eq(items.id, item.id),
        with: { brand: true, category: true, images: true, reviews: true },
      });
    });
  }

  public async getOne(itemId: string) {
    const item = await this.db.query.items.findFirst({
      where: eq(items.id, itemId),
      with: {
        brand: true,
        category: true,
        images: { columns: { itemId: false } },
        reviews: { with: { user: true }, columns: { userId: false } },
      },
    });

    if (!item) {
      throw new NotFoundError("items", itemId);
    }
    return item;
  }

  public async deleteOne(itemId: string) {
    const item = await this.db
      .delete(items)
      .where(eq(items.id, itemId))
      .returning();
    if (!item) {
      throw new NotFoundError("items", itemId);
    }
    return item;
  }

  public async updateOne(itemId: string, body: UpdateItem) {
    return await this.db.transaction(async (tx) => {
      const [item] = await tx
        .update(items)
        .set(body)
        .where(eq(items.id, itemId))
        .returning();

      if (!item) {
        throw new NotFoundError("items", itemId);
      }

      return await tx.query.items.findFirst({
        where: eq(items.id, item.id),
        with: {
          brand: true,
          category: true,
          images: { columns: { itemId: false } },
          reviews: { with: { user: true }, columns: { userId: false } },
        },
      });
    });
  }

  public async addImage(itemId: string, image: string) {
    const url = await ImageUploadService.uploadImage(
      `items/${itemId}/images`,
      image
    );

    const [inserted] = await this.db
      .insert(images)
      .values({ image: url, itemId })
      .returning({ image: images.image });

    if (!inserted) {
      throw new NotFoundError("items", itemId);
    }

    return inserted.image;
  }

  public async addThumbnail(itemId: string, thumbnail: string) {
    const url = await ImageUploadService.uploadImage(
      `items/${itemId}`,
      thumbnail,
      "thumbnail"
    );
    const [inserted] = await this.db
      .update(items)
      .set({ thumbnail: url })
      .where(eq(items.id, itemId))
      .returning({ thumbnail: items.thumbnail });

    if (!inserted) {
      throw new NotFoundError("items", itemId);
    }

    return inserted.thumbnail;
  }

  public async addReview(
    itemId: string,
    userId: string,
    body: CreateItemReview
  ) {
    return await this.db.transaction(async (tx) => {
      const [review] = await tx
        .insert(reviews)
        .values({ itemId, userId, ...body })
        .returning();
      return review;
    });
  }
}
