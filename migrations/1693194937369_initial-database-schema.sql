-- Up Migration
-- Set the timezone to Cairo, Egypt
SET
  TIMEZONE TO 'Africa/Cairo';

-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create UserRole enum
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name varchar(255),
  last_name varchar(255),
  email varchar(255) NOT NULL,
  phone_number varchar(32),
  day_of_birth DATE,
  profile_picture varchar(255),
  role user_role NOT NULL DEFAULT 'user'
);

-- Create Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  address_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(user_id),
  building_number varchar(255),
  apartment_number varchar(255),
  floor_number varchar(255),
  latitude decimal,
  longitude decimal
);

-- Create Categories table
CREATE TABLE IF NOT EXISTS categories (
  category_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL
);

-- Create Brands table
CREATE TABLE IF NOT EXISTS brands (
  brand_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL
);

-- Create Items table
CREATE TABLE IF NOT EXISTS items (
  item_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES categories(category_id),
  brand_id uuid REFERENCES brands(brand_id),
  name varchar(255) NOT NULL,
  thumbnail varchar(255),
  description text,
  price decimal NOT NULL,
  offer_price decimal,
  quantity decimal NOT NULL,
  quantity_type varchar(50) NOT NULL
);

-- Create ItemImages table
CREATE TABLE IF NOT EXISTS item_images (
  image_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid REFERENCES items(item_id),
  image varchar(255) NOT NULL
);

-- Create Carts table
CREATE TABLE IF NOT EXISTS carts (
  cart_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(user_id)
);

-- Create CartItems table
CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id uuid REFERENCES carts(cart_id),
  item_id uuid REFERENCES items(item_id),
  quantity decimal NOT NULL
);

-- Create Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  favorite_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(user_id),
  item_id uuid REFERENCES items(item_id)
);

-- Create OrderStatus enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(user_id),
  order_date timestamp DEFAULT now(),
  total_amount decimal NOT NULL,
  status order_status DEFAULT 'pending'
);

-- Create OrderItems table
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(order_id),
  item_id uuid REFERENCES items(item_id),
  quantity decimal NOT NULL,
  price_per_unit decimal NOT NULL
);

-- Create Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  review_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid REFERENCES items(item_id),
  user_id uuid REFERENCES users(user_id),
  rating integer NOT NULL,
  comment text,
  created_at timestamptz DEFAULT current_timestamp
);

-- Down Migration
-- Drop Reviews table
DROP TABLE IF EXISTS reviews;

-- Drop OrderItems table
DROP TABLE IF EXISTS order_items;

-- Drop Orders table
DROP TABLE IF EXISTS orders;

-- Drop OrderStatus enum
DROP TYPE order_status;

-- Drop Favorites table
DROP TABLE IF EXISTS favorites;

-- Drop CartItems table
DROP TABLE IF EXISTS cart_items;

-- Drop Carts table
DROP TABLE IF EXISTS carts;

-- DROP ItemImages table
DROP TABLE IF EXISTS item_images;

-- Drop Items table
DROP TABLE IF EXISTS items;

-- Drop Brands table
DROP TABLE IF EXISTS brands;

-- Drop Categories table
DROP TABLE IF EXISTS categories;

-- Drop Addresses table
DROP TABLE IF EXISTS addresses;

-- Drop Users table
DROP TABLE IF EXISTS users;

-- Drop Role enum
DROP TYPE user_role;