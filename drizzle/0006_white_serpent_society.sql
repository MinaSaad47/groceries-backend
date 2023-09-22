DROP TABLE "orders_to_items";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paymeny_indent_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cart_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "user_id";