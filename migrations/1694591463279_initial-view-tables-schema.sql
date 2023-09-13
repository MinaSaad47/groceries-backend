-- Up Migration
CREATE
OR REPLACE VIEW reviews_view AS
SELECT
	review_id,
	to_json(users.*) as user,
	to_json(items.*) as item,
	rating,
	comment,
	created_at
FROM
	reviews
	LEFT JOIN items ON items.item_id = reviews.item_id
	LEFT JOIN users ON users.user_id = reviews.user_id;

CREATE
OR REPLACE VIEW items_view AS
SELECT
	items.item_id,
	items.name,
	items.description,
	thumbnail,
	(
		SELECT
			array_agg(image)
		FROM
			item_images
		WHERE
			item_images.item_id = items.item_id
		GROUP BY
			item_images.item_id
		LIMIT
			1
	) AS images,
	to_json(brands.*) as brand,
	to_json(categories.*) as category,
	(
		SELECT
			array_agg(to_json(reviews_view.*))
		FROM
			reviews_view
		WHERE
			(reviews_view.item ->> 'item_id') :: uuid = items.item_id
		GROUP BY
			(reviews_view.item ->> 'item_id') :: uuid
	) AS reviews
FROM
	items
	LEFT JOIN categories ON items.category_id = categories.category_id
	LEFT JOIN brands ON items.brand_id = brands.brand_id;

-- Down Migration
DROP VIEW IF EXISTS reviews_view;

DROP VIEW IF EXISTS items_view;