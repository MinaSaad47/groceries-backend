import { Database } from "@api/v1/db";
import {
  carts,
  cartsToItems,
  items,
  itemsTrans,
  orders,
  ordersToItems,
  User,
} from "@api/v1/db/schema";
import { PaymentService } from "@api/v1/services/payment.service";
import { NotFoundError } from "@api/v1/utils/errors/notfound.error";
import { and, eq, sql } from "drizzle-orm";
import { omit } from "lodash";
import { AuthorizationError } from "../../utils/errors/auth.error";
import { QueryLang } from "../items/items.validation";
import { EmptyCartError, ItemAvailabilityError } from "./carts.errors";

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
      });
    });
  }

  public async getAll(userId: string) {
    return await this.db.query.carts.findMany({
      where: eq(carts.userId, userId),
      with: { items: { columns: { itemId: true, qty: true } } },
      columns: { userId: false },
    });
  }

  public async getOne(user: User, cartId: string, queryLang: QueryLang) {
    return await this.db
      .transaction(async (tx) => {
        await this.authorizeAndCheckIfExists(tx, user, cartId);

        return await tx.query.carts.findFirst({
          where: and(eq(carts.userId, user.id), eq(carts.id, cartId)),
          with: {
            items: {
              with: {
                item: {
                  columns: { qty: false },
                  with: {
                    details: { where: eq(itemsTrans.lang, queryLang.lang) },
                  },
                },
              },
              columns: { cartId: false, itemId: false },
            },
          },
        });
      })
      .then((cart) => ({
        ...cart,
        items: cart?.items.map((item) => ({
          ...item,
          item: {
            ...item.item,
            name: item.item.details[0].name,
            description: item.item.details[0].description,
            details: undefined,
          },
        })),
      }));
  }

  public async addItem(
    user: User,
    cartId: string,
    itemId: string,
    qty: number
  ) {
    return await this.db.transaction(async (tx) => {
      await this.authorizeAndCheckIfExists(tx, user, cartId);

      let item = await tx.query.items.findFirst({
        where: eq(items.id, itemId),
      });
      if (!item) {
        throw new NotFoundError("items", itemId);
      }

      if (item.qty < qty) {
        throw new ItemAvailabilityError(qty, item.qty);
      }

      [item] = await tx
        .update(items)
        .set({ qty: sql`qty - ${qty}` })
        .where(eq(items.id, itemId))
        .returning();

      const [cartItem] = await tx
        .insert(cartsToItems)
        .values({ cartId, itemId, qty })
        .returning();

      return tx.query.cartsToItems.findFirst({
        where: eq(cartsToItems.cartId, cartItem.cartId),
        with: { item: { columns: { qty: false }, with: { details: true } } },
        columns: { itemId: false },
      });
    });
  }

  public async updateItem(
    user: User,
    cartId: string,
    itemId: string,
    qty: number
  ) {
    return await this.db.transaction(async (tx) => {
      await this.authorizeAndCheckIfExists(tx, user, cartId);
      const where = and(
        eq(cartsToItems.cartId, cartId),
        eq(cartsToItems.itemId, itemId)
      );

      const [cartToItem] = await tx
        .update(cartsToItems)
        .set({ qty })
        .where(where)
        .returning();

      if (!cartToItem) {
        throw new NotFoundError("carts_to_items", itemId);
      }
      return tx.query.cartsToItems.findFirst({
        where,
        with: { item: { columns: { qty: false }, with: { details: true } } },
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
        .set({ qty: sql`qty + ${cartToItem.qty}` })
        .where(eq(items.id, itemId));
    });
  }

  public async checkout(user: User, cartId: string) {
    return await this.db.transaction(async (tx) => {
      await this.authorizeAndCheckIfExists(tx, user, cartId);

      // 1. check if the order already exsits
      const cart = await tx.query.carts.findFirst({
        where: eq(carts.id, cartId),
        with: {
          order: true,
          items: { with: { item: true }, columns: { cartId: false } },
        },
      });

      if (cart?.order) {
        // 2. if yes, get payment data and return it attached to the order
        const { clientSecret, publishableKey } =
          await PaymentService.findPayment(cart.order.paymentIntentId);
        const { id, orderDate, status, totalPrice } = cart.order;
        return {
          order: { id, orderDate, status, cartId, totalPrice },
          clientSecret,
          publishableKey,
        };
      }

      // 2. if no, calculate the total price
      const totalPrice =
        cart?.items
          .map(({ qty, item: { price } }) => qty * price)
          .reduce((a, b) => a + b) ?? 0;
      if (totalPrice == 0) {
        throw new EmptyCartError();
      }

      // 3. generate new payment data
      const { clientSecret, paymentIntentId, publishableKey } =
        await PaymentService.createPayment(totalPrice, user.email);

      // 4. create new order
      const [{ id: orderId, orderDate, status }] = await this.db
        .insert(orders)
        .values({
          userId: user.id,
          totalPrice: totalPrice.toString(),
          paymentIntentId,
        })
        .returning();

      // 5. add the items to the order
      const orderItems = cart?.items.map(({ qty, item: { id: itemId } }) => ({
        itemId,
        qty,
        orderId,
      }))!;
      const items = await this.db
        .insert(ordersToItems)
        .values(orderItems)
        .returning();

      // 6. return payment data attached to new the order
      const order = {
        userId: user.id,
        id: orderId,
        orderDate,
        status,
        totalPrice,
        items: items.map((item) => omit(item, "itemId")),
      };

      return { order, clientSecret, publishableKey };
    });
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
      columns: { userId: true },
    });
    if (!cart) {
      throw new NotFoundError("carts", cartId);
    } else if (cart?.userId !== user.id) {
      throw new AuthorizationError("cart", user.id, cartId);
    }
  }
}
