import { Database } from "@api/v1/db";
import { images, items, ordersToItems, reviews } from "@api/v1/db/schema";
import { ImageUploadService } from "@api/v1/services/image_upload.service";
import { NotFoundError } from "@api/v1/utils/errors/notfound.error";
import { SQL, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { ceil } from "lodash";
import {
  CreateItem,
  CreateItemReview,
  QueryItems,
  UpdateItem,
} from "./items.validation";

export class ItemsService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getAll(query?: QueryItems) {
    const orderCountSQ = this.db.$with("order_count_sq").as(
      this.db
        .select({
          itemId: ordersToItems.itemId,
          orderCount: sql<number>`count(${ordersToItems.orderId})`.as(
            "order_count"
          ),
        })
        .from(ordersToItems)
        .groupBy(ordersToItems.itemId)
    );

    const ratingSQ = this.db.$with("rating_sq").as(
      this.db
        .select({
          itemId: reviews.itemId,
          rating: sql<number>`avg(${reviews.rating})`.as("rating"),
        })
        .from(reviews)
        .groupBy(reviews.itemId)
    );

    let statement = this.db
      .with(orderCountSQ, ratingSQ)
      .select({
        ...getTableColumns(items),
        rating: sql`coalesce(${ratingSQ.rating}, 0)::float`.as('rating'),
        orderCount: sql`coalesce(${orderCountSQ.orderCount}, 0)::int`.as('order_count'),
      })
      .from(items)
      .leftJoin(orderCountSQ, eq(items.id, orderCountSQ.itemId))
      .leftJoin(ratingSQ, eq(items.id, ratingSQ.itemId));

    if (query?.where) {
      statement = statement.where(query.where);
    }

    if (query?.orderBy) {
      let orderBy: any = [];

      query.orderBy.forEach((ob) => {
        switch (ob) {
          case "orderCount":
            orderBy.push(desc(orderCountSQ.orderCount));
            break;
          case "price":
            orderBy.push(desc(items.price));
            break;
          case "qty":
            orderBy.push(desc(items.qty));
            break;
          case "rating":
            orderBy.push(desc(ratingSQ.rating));
            break;

          default:
            break;
        }
      });

      statement = statement.orderBy(...orderBy);
    }

    if (Number(query?.limit) > 0 && Number(query?.offset) >= 0) {
      statement = statement.limit(query?.limit!).offset(query?.offset!);

      const [{ count }] = await this.db
        .select({ count: sql<number>`count(${items.id})::int` })
        .from(items);

      const pagination = {
        perPage: query?.limit!,
        page: ceil((query?.offset! + 1) / query?.limit!),
        totalPages: ceil(count / query?.limit!),
      };
      return { items: await statement, ...pagination };
    }

    return await statement;
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
        favoritedUsers: { columns: { userId: true } },
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
