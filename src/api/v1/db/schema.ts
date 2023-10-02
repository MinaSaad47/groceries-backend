import { InferSelectModel, relations } from "drizzle-orm";
import {
  date,
  doublePrecision,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Define an enum for user roles
export const userRole = pgEnum("user_role", ["admin", "user"]);
export type UserRole = (typeof userRole.enumValues)[number];

// Define the "users" table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull().notNull().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 32 }),
  dayOfBirth: date("day_of_birth"),
  profilePicture: varchar("profile_picture", { length: 255 }),
  role: userRole("role").default("user"),
});
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  reviews: many(reviews),
  carts: many(carts),
  favoritedItems: many(favorites),
  orders: many(orders),
}));
export type User = InferSelectModel<typeof users>;

// Define the "addresses" table
export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  buildingNumber: varchar("building_number", { length: 255 }),
  apartmentNumber: varchar("appartment_number", { length: 255 }),
  floorNumber: varchar("floor_number", { length: 255 }),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
});
export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

// Define the "categories" table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  image: text("image"),
});
export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

// Define the "brands" table
export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});
export const brandsRelations = relations(brands, ({ many }) => ({
  items: many(items),
}));

// Define the "items" table
export const items = pgTable("items", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  brandId: uuid("brand_id").references(() => brands.id, {
    onDelete: "set null",
  }),
  thumbnail: varchar("thumbnail", { length: 255 }),
  price: doublePrecision("price").notNull(),
  offerPrice: doublePrecision("offer_price"),
  qty: integer("qty").notNull(),
  qtyType: varchar("qty_type", { length: 50 }).notNull(),
});
export const itemsRelations = relations(items, ({ many, one }) => ({
  reviews: many(reviews),
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, { fields: [items.brandId], references: [brands.id] }),
  images: many(images),
  favoritedUsers: many(favorites),
  carts: many(cartsToItems),
  orders: many(ordersToItems),
  details: many(itemsTrans),
}));

// Define the "item_images" table
export const images = pgTable("item_images", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  image: varchar("image", { length: 255 }).notNull(),
});
export const imagesRelations = relations(images, ({ one }) => ({
  item: one(items, { fields: [images.itemId], references: [items.id] }),
}));

// Define the "carts" table
export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
});
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartsToItems),
  order: one(orders, { fields: [carts.orderId], references: [orders.id] }),
}));

export const cartsToItems = pgTable(
  "carts_to_items",
  {
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    qty: integer("qty").notNull(),
  },
  (t) => ({ pk: primaryKey(t.cartId, t.itemId) })
);
export const cartsToItemsRelations = relations(cartsToItems, ({ one }) => ({
  item: one(items, { fields: [cartsToItems.itemId], references: [items.id] }),
  cart: one(carts, { fields: [cartsToItems.cartId], references: [carts.id] }),
}));

// Define an enum for order status
export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "canceled",
]);
export type OrderStatus = (typeof orderStatus.enumValues)[number];

// Define the "orders" table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  paymentIntentId: text("paymeny_indent_id").notNull(),
  orderDate: date("order_date").defaultNow(),
  totalPrice: numeric("total_price").notNull(),
  status: orderStatus("status").default("pending"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
});
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(ordersToItems),
  cart: one(carts, { fields: [orders.id], references: [carts.orderId] }),
}));

export const ordersToItems = pgTable(
  "orders_to_items",
  {
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id),
    qty: integer("qty").notNull(),
  },
  (t) => ({ pk: primaryKey(t.orderId, t.itemId) })
);
export const ordersToItemsRelations = relations(ordersToItems, ({ one }) => ({
  order: one(orders, {
    fields: [ordersToItems.orderId],
    references: [orders.id],
  }),
  item: one(items, {
    fields: [ordersToItems.itemId],
    references: [items.id],
  }),
}));

// Define the "reviews" table
export const reviews = pgTable(
  "reviews",
  {
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: doublePrecision("rating").notNull(),
    comment: text("comment"),
    createdAt: date("created_at").defaultNow(),
  },
  (t) => ({ pk: primaryKey(t.userId, t.itemId) })
);
export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  item: one(items, { fields: [reviews.itemId], references: [items.id] }),
}));

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    itemId: uuid("item_id").references(() => items.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey(t.userId, t.itemId) })
);
export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  item: one(items, { fields: [favorites.itemId], references: [items.id] }),
}));
export const itemsTrans = pgTable(
  "items_trans",
  {
    name: text("name").notNull(),
    description: text("description").notNull(),
    lang: varchar("lang", { length: 5 }).notNull(),
    itemId: uuid("itemId").references(() => items.id),
  },
  (t) => ({ pk: primaryKey(t.itemId, t.lang) })
);

export const itemsTransRelations = relations(itemsTrans, ({ one }) => ({
  item: one(items, { fields: [itemsTrans.itemId], references: [items.id] }),
}));
