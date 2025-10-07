/** biome-ignore-all lint/style/noNonNullAssertion: Ignore for this file */

import { defineConfig } from "drizzle-kit";

// Local configuration for Drizzle Studio
// Uses the local D1 SQLite database file directly
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b4bd962c35f80d00b6f49b48b6c4d585936a6c9a8a966695c71421975bd61e4d.sqlite",
  },
});
