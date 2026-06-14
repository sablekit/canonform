/**
 * Database client (Drizzle + postgres.js).
 *
 * The connection is created lazily on first use, so importing this module never
 * opens a socket — `next build`, type-checking, and tests can import schema and
 * types without a live database. Call `getDb()` to get the singleton client.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/** The Drizzle database type (postgres.js driver), shared by the repo layer. */
export type Database = ReturnType<typeof drizzle<typeof schema>>;

let database: Database | undefined;

export function getDb() {
  if (!database) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set — copy .env.example to .env and add your Postgres connection string.",
      );
    }
    // `prepare: false` keeps us compatible with transaction-mode poolers
    // (Supabase/Neon/PgBouncer), which don't support prepared statements.
    const client = postgres(url, { prepare: false });
    database = drizzle(client, { schema });
  }
  return database;
}

export * from "./schema";
