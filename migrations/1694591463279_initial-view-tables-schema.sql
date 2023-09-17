-- Up Migration
-- Create Reviews View
CREATE OR REPLACE VIEW reviews_view AS
SELECT review_id,
	to_json(users.*) as user,
	to_json(items.*) as item,
	rating,
	comment,
	created_at
FROM reviews
	LEFT JOIN items ON items.item_id = reviews.item_id
	LEFT JOIN users ON users.user_id = reviews.user_id;
-- Create Items View
CREATE OR REPLACE VIEW items_view AS
SELECT items.item_id,
	items.name,
	items.description,
	items.price,
	items.quantity,
	items.quantity_type,
	thumbnail,
	(
		SELECT array_agg(image)
		FROM item_images
		WHERE item_images.item_id = items.item_id
		GROUP BY item_images.item_id
		LIMIT 1
	) AS images,
	to_json(brands.*) as brand,
	to_json(categories.*) as category,
	(
		SELECT array_agg(to_json(reviews_view.*))
		FROM reviews_view
		WHERE (reviews_view.item->>'item_id')::uuid = items.item_id
		GROUP BY (reviews_view.item->>'item_id')::uuid
	) AS reviews
FROM items
	LEFT JOIN categories ON items.category_id = categories.category_id
	LEFT JOIN brands ON items.brand_id = brands.brand_id;
-- Create Carts View
CREATE OR REPLACE VIEW carts_view AS
SELECT cart_id,
	ruser AS user,
	COALESCE(ritems, array []::json []) as items
FROM carts
	LEFT JOIN LATERAL (
		SELECT to_json(users.*) AS ruser
		FROM users
		WHERE users.user_id = carts.user_id
	) AS _1 ON TRUE
	LEFT JOIN LATERAL (
		SELECT array_agg(to_json(items.*)) AS ritems
		FROM cart_items
			LEFT JOIN items ON cart_items.item_id = items.item_id
		WHERE cart_items.cart_id = carts.cart_id
	) AS _2 ON TRUE;
-- Down Migration
DROP VIEW IF EXISTS carts_view;
DROP VIEW IF EXISTS items_view;
DROP VIEW IF EXISTS reviews_view;