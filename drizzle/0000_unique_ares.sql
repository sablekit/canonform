CREATE TYPE "public"."page_status" AS ENUM('ready', 'stub');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "links" (
	"world_id" text NOT NULL,
	"src_slug" text NOT NULL,
	"dst_slug" text NOT NULL,
	"anchor" text NOT NULL,
	"context_hint" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "links_world_id_src_slug_dst_slug_pk" PRIMARY KEY("world_id","src_slug","dst_slug")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"world_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"status" "page_status" DEFAULT 'ready' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_world_id_slug_pk" PRIMARY KEY("world_id","slug")
);
--> statement-breakpoint
CREATE TABLE "worlds" (
	"id" text PRIMARY KEY NOT NULL,
	"seed" text NOT NULL,
	"title" text,
	"canon_facts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "links_world_dst_idx" ON "links" USING btree ("world_id","dst_slug");--> statement-breakpoint
CREATE INDEX "links_world_src_idx" ON "links" USING btree ("world_id","src_slug");