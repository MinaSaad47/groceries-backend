import { Database } from "@api/v1/db";
import { favorites, users } from "@api/v1/db/schema";
import { and, eq } from "drizzle-orm";
import { UserUpdateBody } from "../users/users.type";

export class ProfileService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getOne(userId: string) {
    return await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { addresses: true, reviews: true, carts: true },
    });
  }

  public async updateOne(userId: string, body: UserUpdateBody) {
    return await this.db.transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set(body)
        .where(eq(users.id, userId))
        .returning();
      return await tx.query.users.findFirst({
        where: eq(users.id, user.id),
        with: { addresses: true, reviews: true, carts: true },
      });
    });
  }

  public async addFavorite(userId: string, itemId: string) {
    const [favorite] = await this.db
      .insert(favorites)
      .values({ userId, itemId })
      .returning();
    return favorite;
  }

  public async deleteFavorite(userId: string, itemId: string) {
    const [favorite] = await this.db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)))
      .returning();
    return favorite;
  }

  public async getAllFavorites(userId: string) {
    const allFavorites = await this.db.query.favorites.findMany({
      where: eq(favorites.userId, userId),
      with: { item: true },
      columns: { userId: false, itemId: false },
    });
    return allFavorites.map((af) => af.item);
  }
}
