import { Database } from "@api/v1/db";
import {
  OrderStatus,
  User,
  addresses,
  favorites,
  items,
  itemsTrans,
  orders,
  users,
} from "@api/v1/db/schema";
import { NotFoundError } from "@api/v1/utils/errors/notfound.error";
import { SQL, and, eq, getTableColumns } from "drizzle-orm";
import { omit } from "lodash";
import { QueryItems } from "../items/items.validation";
import { UpdateUser } from "../users/users.validation";
import { CreateAddress } from "./profile.validation";

export class ProfileService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getOne(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { addresses: true, reviews: true, carts: true },
    });

    if (!user) {
    }

    return user;
  }

  public async updateOne(
    userId: string,
    body: UpdateUser & { profilePicture?: string }
  ) {
    return await this.db.transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set(body)
        .where(eq(users.id, userId))
        .returning();

      if (!user) {
        throw new NotFoundError("users", userId);
      }

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

  public async getAllFavorites(userId: string, query: QueryItems) {
    const transColumns = Object.values(getTableColumns(itemsTrans));
    const transSQ = this.db.$with("trans_sq").as(
      this.db
        .select()
        .from(itemsTrans)
        .groupBy(...transColumns)
        .where(eq(itemsTrans.lang, query?.lang ?? ("en" as string)))
    );

    return await this.db
      .with(transSQ)
      .select({...getTableColumns(items), name: transSQ.name, description: transSQ.description})
      .from(items)
      .leftJoin(transSQ, eq(items.id, transSQ.itemId))
      .leftJoin(favorites, eq(items.id, favorites.itemId))
      .where(eq(favorites.userId, userId));
  }

  public async addAddress(userId: string, address: CreateAddress) {
    return await this.db
      .insert(addresses)
      .values({ ...address, userId })
      .returning();
  }

  public async deleteAddress(userId: string, addressId: string) {
    const address = await this.db
      .delete(addresses)
      .where(and(eq(addresses.userId, userId), eq(addresses.id, addressId)))
      .returning();
    if (!address) {
      throw new NotFoundError("addresses", addressId);
    }
    return address;
  }

  public async getAllOrders(userId: string) {
    return await this.db.query.orders.findMany({
      where: eq(orders.userId, userId),
      columns: { userId: false, paymentIntentId: false },
    });
  }

  public async updateOrderStatus(
    params:
      | { user: User; orderId: string }
      | { user: "admin"; paymentIntentId: string },
    status: OrderStatus
  ) {
    let where: SQL;
    if (params.user === "admin") {
      where = eq(orders.paymentIntentId, params.paymentIntentId);
    } else {
      where = and(
        eq(orders.userId, params.user.id),
        eq(orders.id, params.orderId)
      )!;
    }
    const [order] = await this.db
      .update(orders)
      .set({ status })
      .where(where)
      .returning();
    if (!order) {
      throw new NotFoundError("orders");
    }

    return omit(order, "paymentIntentID");
  }

  public async getOneOrder(orderId: string) {
    return await this.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          columns: { orderId: false, itemId: false },
          with: { item: { columns: { qty: false } } },
        },
      },
      columns: { userId: false, paymentIntentId: false },
    });
  }
}
