-- Up Migration

-- Set the timezone to Cairo, Egypt
SET TIMEZONE TO 'Africa/Cairo';

-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create UserRole enum
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create Users table
CREATE TABLE users (
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user'
);

-- Create Categories table
CREATE TABLE categories (
  category_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL
);

-- Create Brands table
CREATE TABLE brands (
  brand_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL
);

-- Create Items table
CREATE TABLE items (
  item_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES categories(category_id),
  brand_id uuid REFERENCES brands(brand_id),
  name varchar(255) NOT NULL,
  description text
);

-- Create Prices table
CREATE TABLE prices (
  price_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid REFERENCES items(item_id),
  quantity_type varchar(50) NOT NULL,
  quantity decimal NOT NULL,
  price decimal NOT NULL
);

-- Create Carts table
CREATE TABLE carts (
  cart_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(user_id)
);

-- Create CartItems table
CREATE TABLE cart_items (
  cart_item_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id uuid REFERENCES carts(cart_id),
  item_id uuid REFERENCES items(item_id),
  quantity decimal NOT NULL
);

-- Create Favorites table
CREATE TABLE favorites (
  favorite_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(user_id),
  item_id uuid REFERENCES items(item_id)
);

-- Down Migration

-- Drop Favorites table
DROP TABLE IF EXISTS favorites;

-- Drop CartItems table
DROP TABLE IF EXISTS cart_items;

-- Drop Carts table
DROP TABLE IF EXISTS carts;

-- Drop Prices table
DROP TABLE IF EXISTS prices;

-- Drop Items table
DROP TABLE IF EXISTS items;

-- Drop Brands table
DROP TABLE IF EXISTS brands;

-- Drop Categories table
DROP TABLE IF EXISTS categories;

-- Drop Users table
DROP TABLE IF EXISTS users;

-- Drop Role enum
DROP TYPE user_role;