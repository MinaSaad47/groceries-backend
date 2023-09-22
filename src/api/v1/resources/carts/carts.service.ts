import { Database } from "@api/v1/db";
import {
  carts,
  cartsToItems,
  items,
  orders,
  OrderStatus,
  orderStatus,
  User,
} from "@api/v1/db/schema";
import { NotFoundError } from "@api/v1/utils/errors/notfound.error";
import { and, eq, getTableColumns, or, sql, SQL } from "drizzle-orm";
import { PaymentService } from "@api/v1/services/payment.service";
import { ItemAvailabilityError } from "./carts.errors";
import { AuthorizationError } from "../../utils/errors/auth.error";

export class CartsService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async createOne(userId: string) {
    return await this.db.transaction(async (tx) => {
      const [cart] = await tx.insert(carts).values({ userId }).returning();
      return tx.query.carts.findFirst({
        where: eq(carts.id, cart.id),
        with: { items: true },
      });
    });
  }

  public async getAll(userId: string) {
    return await this.db.query.carts.findMany({
      where: eq(carts.userId, userId),
      with: { items: { columns: { itemId: true, quantity: true } } },
      columns: { userId: false },
    });
  }

  public async getOne(user: User, cartId: string) {
    return await this.db.transaction(async (tx) => {
      await this.authorizeAndCheckIfExists(tx, user, cartId);

      return await tx.query.carts.findFirst({
        where: eq(carts.id, cartId),
        with: {
          order: {
            columns: { paymentIntentId: false, id: false, cartId: false },
          },
          items: {
            with: { item: true },
            columns: { cartId: false, itemId: false },
          },
        },
      });
    });
  }

  public async addItem(
    user: User,
    cartId: string,
    itemId: string,
    quantity: number
  ) {
    return await this.db.transaction(async (tx) => {
      await this.authorizeAndCheckIfExists(tx, user, cartId);

      let item = await tx.query.items.findFirst({
        where: eq(items.id, itemId),
      });
      if (!item) {
        throw new NotFoundError("items", itemId);
      }

      if (item.quantity < quantity) {
        throw new ItemAvailabilityError(quantity, item.quantity);
      }

      [item] = await tx
        .update(items)
        .set({ quantity: item.quantity - quantity })
        .where(eq(items.id, itemId))
        .returning();

      const [cartItem] = await tx
        .insert(cartsToItems)
        .values({ cartId, itemId, quantity: quantity.toString() })
        .returning();

      return tx.query.cartsToItems.findFirst({
        where: eq(cartsToItems.cartId, cartItem.cartId),
        with: { item: { columns: { quantity: false } } },
        columns: { itemId: false },
      });
    });
  }

  public async deleteItem(user: User, cartId: string, itemId: string) {
    await this.db.transaction(async (tx) => {
      await this.authorizeAndCheckIfExists(tx, user, cartId);

      const where = and(
        eq(cartsToItems.cartId, cartId),
        eq(cartsToItems.itemId, itemId)
      );

      const [cartToItem] = await tx
        .delete(cartsToItems)
        .where(where)
        .returning();

      if (!cartToItem) {
        throw new NotFoundError("carts_to_items", itemId);
      }

      await tx
        .update(items)
        .set({ quantity: sql`quantity + ${cartToItem.quantity}` })
        .where(eq(items.id, itemId));
    });
  }

  public async createOrder(user: User, cartId: string) {
    return await this.db.transaction(async (tx) => {
      await this.authorizeAndCheckIfExists(tx, user, cartId);

      const cart = await tx.query.carts.findFirst({
        where: eq(carts.id, cartId),
        with: {
          items: {
            with: { item: true },
            columns: { cartId: false, itemId: false },
          },
        },
      });

      let totalPrice = 0;

      cart?.items.forEach(({ quantity, item }) => {
        const itemPrice = Number(quantity) * Number(item.price);
        totalPrice += itemPrice;
      });

      const prevOrder = await tx.query.orders.findFirst({
        where: or(eq(orders.cartId, cartId), eq(orders.status, "pending")),
      });

      if (prevOrder) {
        const { clientSecret, publishableKey } =
          await PaymentService.findPayment(prevOrder.paymentIntentId);
        const { id, orderDate, status } = prevOrder;
        return {
          order: { id, orderDate, status, cartId, totalPrice },
          clientSecret,
          publishableKey,
        };
      }

      const { clientSecret, paymentIntentId, publishableKey } =
        await PaymentService.createPayment(totalPrice, user.email);

      const [{ id, orderDate, status }] = await this.db
        .insert(orders)
        .values({ cartId, totalPrice: totalPrice.toString(), paymentIntentId })
        .returning();

      const order = { cartId, id, orderDate, status, totalPrice };

      return { order, clientSecret, publishableKey };
    });
  }

  public async deleteOrder(user: User, cartId: string) {
    await this.authorizeAndCheckIfExists(this.db, user, cartId);

    const [order] = await this.db
      .delete(orders)
      .where(eq(orders.cartId, cartId))
      .returning();

    if (!order) {
      throw new NotFoundError("orders", cartId);
    }

    const { orderDate, totalPrice } = order;

    return { orderDate, totalPrice, status: "canceled" };
  }

  public async updateOrder(
    user: User | "admin",
    update: { paymentIntentId?: string; cartId?: string },
    status: OrderStatus
  ) {
    let where: SQL[] = [];

    update.cartId && where.push(eq(carts.id, update.cartId));

    const cart = await this.db.query.carts.findFirst({
      where: and(...where),
    });

    if (!cart) {
      throw new NotFoundError("carts");
    }

    await this.authorizeAndCheckIfExists(this.db, user, cart.id);

    where = [];

    update.paymentIntentId &&
      where.push(eq(orders.paymentIntentId, update.paymentIntentId));
    update.cartId && where.push(eq(orders.cartId, update.cartId));

    const [order] = await this.db
      .update(orders)
      .set({ status })
      .where(and(...where))
      .returning();
    if (!order) {
      throw new NotFoundError("orders");
    }

    return order;
  }

  private async authorizeAndCheckIfExists(
    ctx: Database,
    user: User | "admin",
    cartId: string
  ) {
    if (user === "admin" || user.role === "admin") {
      return;
    }

    const cart = await ctx.query.carts.findFirst({
      where: eq(carts.id, cartId),
    });
    if (!cart) {
      throw new NotFoundError("carts", cartId);
    } else if (cart?.userId !== user.id) {
      throw new AuthorizationError("cart", user.id, cartId);
    }
  }
}
