import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(env: Cloudflare.Env) {
  return drizzle(env.dental_data, { schema });
}

export async function getDb() {
  const { env } = await getCloudflareContext();
  return createDb(env as unknown as Cloudflare.Env);
}

export async function getKV() {
  const { env } = await getCloudflareContext();
  return env.KV_DENTAL;
}

export * from "./schema";
