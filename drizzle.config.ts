/**
 * drizzle-kit config — used by the `db:*` scripts (generate/migrate/push/studio).
 * Not bundled into the app; only the CLI reads it. `dotenv` loads DATABASE_URL
 * from your local `.env` so the commands work without exporting env vars by hand.
 */
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
