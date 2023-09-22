CREATE TABLE IF NOT EXISTS "carts_to_items" (
	"cart_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" numeric NOT NULL,
	CONSTRAINT carts_to_items_cart_id_item_id PRIMARY KEY("cart_id","item_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carts_to_items" ADD CONSTRAINT "carts_to_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carts_to_items" ADD CONSTRAINT "carts_to_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
